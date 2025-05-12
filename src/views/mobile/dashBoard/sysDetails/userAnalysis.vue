<template>
  <div class="card-analysis" id="userAnalysis">
    <div v-if="isFirstTab" ref="borderLTopRef" class="border-left-top"></div>
    <div v-if="isFirstTab" ref="borderRTopRef" class="border-right-top"></div>
    <!-- 用户分析 -->
    <card-wrap
      :class="['card-wrap', { 'radius-wrap': isFirstTab }]"
      title="用户分析"
      :staticTime="staticTime"
    >
      <template #default>
        <card-main :showHeader="false">
          <div class="header-box">
            <!-- 用户维度类型 -->
            <tag-box
              v-model:active="data.tagType"
              :tagList="data.tagList"
              @handleTag="handleTag"
            />

            <!-- 筛选 -->
            <dropDownCascade
              ref="dropDownCascadeRef"
              v-model:checkId="data.checkId"
              v-model:checkName="data.checkName"
              isShowCompRadio
              :expandLevel="data.tagType === '2' ? 2 : 1"
              :checkOps="data.checkOps"
              :dropType="data.tagType === '3' ? 'select' : 'tree'"
              :headerColumn="headerColumn"
              @checkChange="checkChange"
              @scrollToPlace="scrollToPlace('userAnalysis')"
            ></dropDownCascade>
          </div>

          <!-- 卡片数据 -->
          <card-type-box
            v-model:cardId="data.cardId"
            :cardList="data.cardList"
            @handleCard="handleCard"
          />

          <echart-bar
            height="190"
            isHideTipEvent
            :echartTitle="getEchartTitle('line')"
            :opsObj="data.userSunmaryOps"
            :key="data.echartLineKey"
          ></echart-bar>

          <echart-bar
            v-if="hasShowPieChart"
            height="220"
            isTriggerEvent
            isHideTipEvent
            :echartTitle="getEchartTitle('pie')"
            :opsObj="data.activeUserOps"
            :selectedData="data.selectedData"
            :key="data.echartPieKey"
            @clickLabelEvent="clickLabelEvent"
          ></echart-bar>

          <echart-bar
            v-if="hasShowBarChart"
            height="190"
            isTriggerEvent
            isHideTipEvent
            xLabelInAxis
            :xLabelInAxisLen="11"
            :echartTitle="getEchartTitle('bar')"
            :opsObj="data.visitNumTimeOps"
            :selectedData="data.selectedData"
            :key="data.echartBarKey"
            @clickLabelEvent="clickLabelEvent"
          ></echart-bar>

          <div class="no-data-box" v-if="isFinished && !hasReportTrack">
            <template v-if="data.tagType === '2'">
              <span> 组织信息未上报到埋点平台 </span>
              <span>暂无组织分布数据</span>
              <img :src="data.noDataImg" alt="" />
            </template>
            <template v-if="data.tagType === '3'">
              <span> 角色信息未上报到埋点平台 </span>
              <span>暂无角色分布数据</span>
              <img :src="data.noDataImg" alt="" />
            </template>
          </div>

          <card-table
            v-if="showTop5Data"
            class="user-top5-table"
            :topTable="data.userTop5TableData"
            title="常用用户"
            :unit="top5Unit"
          ></card-table>

          <div class="look-all">
            <span @click="jumpLineDoc">查看全部 >></span>
          </div>
        </card-main>
      </template>
    </card-wrap>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  getCurrentInstance,
  onMounted,
  computed,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import cardWrap from "../components/cardWrap.vue";
import cardMain from "../components/cardMain.vue";
import tagBox from "./components/tagBox.vue";
import dropDownCascade from "./components/dropDownCascade.vue";
import cardTypeBox from "./components/cardTypeBox.vue";
import cardTable from "./components/cardTable.vue";
import echartBar from "@/components/EchartBar.vue";
import {
  moveItemToPlace,
  findNodePath,
  deepClone,
  findNodeById,
} from "@/common/utils/comm";
import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showLoadingToast, showFailToast, closeToast } from "vant";
import {
  active_user_pie,
  visit_num_time_bar,
  user_sunmary_line,
  getColorList,
  getRandomColorExcluding,
} from "./config";

defineOptions({
  inheritAttrs: false,
});
const { proxy } = getCurrentInstance();
const router = useRouter();
const props = defineProps({
  staticTime: {
    type: String,
    default: "",
  },
  sysCode: {
    type: String,
    default: "",
  },
  pageData: {
    type: Object,
    default: () => {},
  },
  userData: {
    type: Object,
    default: () => {},
  },
  // 组织级联树
  orgTree: {
    type: Array,
    default: () => [],
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  // 是否为第一个tab
  isFirstTab: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["scrollToPlace"]);
const borderLTopRef = ref(null);
const borderRTopRef = ref(null);
const dropDownCascadeRef = ref(null);

const data = reactive({
  oriPageData: [], // 系统详情数据
  oriUserRoleData: [], // 原始用户角色数据
  userOrgData: [], // 用户组织数据
  userRoleData: [], // 用户角色数据
  // 用户类型维度
  tagType: "2",
  tagList: [
    {
      name: "按组织",
      type: "2",
    },
    {
      name: "按角色",
      type: "3",
    },
  ],
  roleTree: [], // 角色下拉列表
  pieBarList: [], // 饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  lineList: [], // 折线图数据--包含全部、不含其他

  cardId: "dailyActiveUserCount",
  cardList: [
    {
      id: "dailyActiveUserCount",
      name: "日活跃用户",
      value: null,
      unit: "人",
      rateVal: null,
      tip: "指当日有浏览页面的用户数量（AU）。<br/>从埋点平台取当日有浏览页面的用户，根据用户的id去重。每个用户在埋点平台拥有唯一的用户id，跟设备无关。",
      // tip: "指当日访问过系统的用户数量。<br/>（1）接了埋点的系统，从埋点平台取当日访问过系统的用户，根据用户的id去重。每个用户在埋点平台拥有唯一的用户id，跟设备无关。例如：用户从PC端访问了一次系统，从APP端访问了一次系统，从小程序端访问了一次系统，日活用户数只会+1。<br/>（2）没接埋点的系统，从监控系统取当日访问过系统的用户，视为活跃用户，根据用户的ip地址去重。",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "monthlyActiveUserCount",
      name: "月活跃用户",
      value: null,
      unit: "人",
      rateVal: null,
      tip: "指当月访问过系统的用户数量。<br/>从埋点平台取当月访问过系统的去重用户数。",
      // tip: "指当月访问过系统的用户数量。<br/>（1） 接了埋点的系统，月活从埋点平台取当月访问过系统的去重用户数。<br/>（2）没接埋点的系统，通过监控系统取用户的ip地址去重数。",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "aveVisitsNumberUba",
      name: "人均页面浏览量",
      value: null,
      unit: "次",
      rateVal: null,
      rateUnit: "次",
      tip: "指系统当日人均浏览页面的次数。<br/>人均页面浏览量=所有用户浏览页面的总次数/日活跃用户数。",
      // tip: "指系统当日人均浏览页面的次数。<br/>人均页面浏览量=所有用户浏览页面的总次数/日活跃用户数。<br/>目前仅统计接入埋点的系统，没接埋点的系统，暂不统计。",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "aveVisitsTimeUba",
      name: "人均浏览时长",
      value: null,
      unit: "",
      rateVal: null,
      tip: "指当日人均浏览页面的时长。<br/>人均浏览时长=所有用户浏览页面的总时长/日活跃用户数。",
      // tip: "指当日人均浏览页面的时长。<br/>人均浏览时长=所有用户浏览页面的总时长/日活跃用户数。<br/>目前仅统计接入埋点的系统，没接埋点的系统，暂不统计。",
      rateTxt: "较上日",
      showUnit: false,
      isCnTime: true,
      showPopover: false,
    },
  ],

  checkId: "-1",
  checkName: "全部",
  checkOps: [],
  checkObj: {}, // 下拉选中数据

  selectedData: [], // 饼图点击后的缓存数据，用于饼图点击事件（可选择可取消）
  activeUserOps: active_user_pie(),
  visitNumTimeOps: visit_num_time_bar(),
  userSunmaryOps: user_sunmary_line(),
  userTop5TableData: [], // 常用用户top5

  noDataImg: require("@/assets/images/not-data.svg"),
  colorMap: {}, // 图表颜色盘（汇总蓝色，超过8个合并为其他角色灰色）

  echartPieKey: Math.random() + 0,
  echartBarKey: Math.random() + 1,
  echartLineKey: Math.random() + 2,
  barLineLen: 8, // 默认显示多少个图表数据
  hasReportOrg: true, // 是否推送组织数据
  hasReportRole: true, // 是否推送角色数据
  extraList: [], // 其他角色名称集合
});

onMounted(() => {
  if (proxy.$isIphone) {
    borderLTopRef.value && (borderLTopRef.value.style.display = "none");
    borderRTopRef.value && (borderRTopRef.value.style.display = "none");
  }
});

// 下拉框
const headerColumn = computed(() => {
  return [
    {
      lable:
        data.tagType === "2"
          ? "组织名称"
          : data.tagType === "3"
          ? "角色名称"
          : "",
      prop: "name",
    },
    {
      lable:
        data.cardId === "dailyActiveUserCount"
          ? "日活跃用户数(人)"
          : data.cardId === "monthlyActiveUserCount"
          ? "月活跃用户数(人)"
          : data.cardId === "aveVisitsNumberUba"
          ? "人均页面浏览量(次)"
          : data.cardId === "aveVisitsTimeUba"
          ? "人均浏览时长"
          : "",
      prop: data.cardId,
      minWidth: proxy.$px2rem("110"),
      headerAlign: "right",
    },
  ];
});

// 获取图表标题
const getEchartTitle = computed(() => {
  return (echartType) => {
    let titleMap = {
      2: {
        line: {
          dailyActiveUserCount: "日活跃用户趋势",
          monthlyActiveUserCount: "月活跃用户趋势",
          aveVisitsNumberUba: "人均页面浏览量趋势",
          aveVisitsTimeUba: "人均浏览时长趋势",
        },
        pie: {
          dailyActiveUserCount: "日活跃用户分布",
          monthlyActiveUserCount: "月活跃用户分布",
        },
        bar: {
          aveVisitsNumberUba: "各组织人均页面浏览量",
          aveVisitsTimeUba: "各组织人均浏览时长",
        },
      },
      3: {
        line: {
          dailyActiveUserCount: "日活跃用户趋势",
          monthlyActiveUserCount: "月活跃用户趋势",
          aveVisitsNumberUba: "人均页面浏览量趋势",
          aveVisitsTimeUba: "人均浏览时长趋势",
        },
        pie: {
          dailyActiveUserCount: "日活跃用户分布",
          monthlyActiveUserCount: "月活跃用户分布",
        },
        bar: {
          aveVisitsNumberUba: "各角色人均页面浏览量",
          aveVisitsTimeUba: "各角色人均浏览时长",
        },
      },
    };
    return titleMap[data.tagType][echartType][data.cardId] || "";
  };
});
// 其他名称（其他角色、其他组织）
const otherName = computed(() => {
  return data.tagType === "2"
    ? "其他组织"
    : data.tagType === "3"
    ? "其他角色"
    : "";
});
// 是否上报埋点
const hasReportTrack = computed(() => {
  return data.tagType === "2"
    ? data.hasReportOrg
    : data.tagType === "3"
    ? data.hasReportRole
    : false;
});
// 是否显示饼图
const hasShowPieChart = computed(() => {
  if (data.tagType === "2") {
    return (
      hasReportTrack.value &&
      data.pieBarList.length > 1 &&
      (data.cardId === "dailyActiveUserCount" ||
        data.cardId === "monthlyActiveUserCount")
    );
  } else if (data.tagType === "3") {
    return (
      hasReportTrack.value &&
      data.checkName === "全部" &&
      (data.cardId === "dailyActiveUserCount" ||
        data.cardId === "monthlyActiveUserCount")
    );
  }
});
// 是否显示柱状图
const hasShowBarChart = computed(() => {
  if (data.tagType === "2") {
    return (
      hasReportTrack.value &&
      data.pieBarList.length > 1 &&
      (data.cardId === "aveVisitsNumberUba" ||
        data.cardId === "aveVisitsTimeUba")
    );
  } else if (data.tagType === "3") {
    return (
      hasReportTrack.value &&
      data.checkName === "全部" &&
      (data.cardId === "aveVisitsNumberUba" ||
        data.cardId === "aveVisitsTimeUba")
    );
  }
});

const top5Unit = computed(() => {
  return data.cardId === "aveVisitsNumberUba"
    ? "（浏览量：次）"
    : data.cardId === "aveVisitsTimeUba"
    ? "（浏览时长：秒）"
    : "";
});

const showTop5Data = computed(() => {
  return (
    (data.cardId === "aveVisitsNumberUba" ||
      data.cardId === "aveVisitsTimeUba") &&
    data.checkName === "全部"
  );
});

// 初始化数据 isFirstLoad:是否第一次加载
const initData = (isFirstLoad = true) => {
  data.checkName = "全部";
  data.checkId = "-1";
  data.checkOps = [];
  data.checkObj = {};
  data.selectedData = [];
  data.echartPieKey = Math.random() + 0;
  data.echartBarKey = Math.random() + 1;
  data.echartLineKey = Math.random() + 2;
  if (data.checkName === "全部") {
    data.userOrgData = data.oriPageData?.userAnalysis?.userAnalysisByOrg || {};
    data.userRoleData = data.oriUserRoleData;
  }

  getCheckData();
  getCardData();
  getChartData();
  getUserTop5Data();
};
const getCheckData = () => {
  let { tagType, cardId, roleTree } = data;
  if (tagType === "3") {
    roleTree.sort((a, b) => b[cardId] - a[cardId]);
    // 将全部放到最前
    moveItemToPlace(
      roleTree,
      roleTree.findIndex((_) => _.name === "全部"),
      "start"
    );
    data.checkOps = roleTree; // 角色列表降序
  } else if (tagType === "2") {
    data.checkOps = props.orgTree;
  }
};
const getCardData = () => {
  let { tagType, checkName, roleTree, userOrgData } = data;
  let checkObj = {};
  if (tagType === "3") {
    checkObj = roleTree.find((_) => _.name === checkName) || {};
  } else if (tagType === "2") {
    if (checkName === "全部") {
      checkObj = userOrgData.sysUba || {};
    } else {
      checkObj = findNodeById(props.orgTree, checkName, "name");
    }
  }

  console.log("checkObj", checkObj);
  data.cardList[0].value = checkObj.dailyActiveUserCount;
  data.cardList[0].rateVal = checkObj.dailyActiveUserCountFront;
  data.cardList[1].value = checkObj.monthlyActiveUserCount;
  data.cardList[1].rateVal = checkObj.monthlyActiveUserCountFront;
  data.cardList[2].value = checkObj.aveVisitsNumberUba;
  data.cardList[2].rateVal = checkObj.aveVisitsNumberUbaFront;
  data.cardList[3].value = checkObj.aveVisitsTimeUba;
  data.cardList[3].rateVal = checkObj.aveVisitsTimeUbaFront;
};
const getUserTop5Data = () => {
  let { checkName, cardId, oriPageData } = data;
  if (checkName !== "全部") {
    data.userTop5TableData = [];
    return;
  }
  let tableData = [];
  if (cardId === "aveVisitsNumberUba") {
    tableData = oriPageData?.userAnalysis?.aveVisitsNumberUserInfoList || [];
    tableData = tableData.map((_) => {
      let name =
        _.userName && _.userId
          ? _.userName + "(" + _.userId + ")"
          : _.userName && !_.userId
          ? _.userName
          : _.userId && !_.userName
          ? _.userId
          : "--";
      return {
        name,
        value: _.value,
      };
    });
  } else if (cardId === "aveVisitsTimeUba") {
    tableData = oriPageData?.userAnalysis?.aveVisitsTimeUserInfoList || [];
    let maxValue = Math.max(...tableData.map((_) => _.value));
    tableData = tableData.map((_) => {
      let name =
        _.userName && _.userId
          ? _.userName + "(" + _.userId + ")"
          : _.userName && !_.userId
          ? _.userName
          : _.userId && !_.userName
          ? _.userId
          : "--";
      let value = _.value || 0;
      value = value < 1000 && value > 0 ? 1000 : value;
      return {
        name,
        value,
        type: "time",
        maxValue,
      };
    });
  }
  data.userTop5TableData = tableData;
};
const getChartData = () => {
  factoryChartData(); // 加工图表数据
  let { cardId } = data;
  if (
    cardId === "dailyActiveUserCount" ||
    cardId === "monthlyActiveUserCount"
  ) {
    getPieData(); // 饼图
  } else if (cardId === "aveVisitsNumberUba" || cardId === "aveVisitsTimeUba") {
    getBarData(); // 柱状图
  }
  getLineData(); // 折线图
};
// 加工图表数据
const factoryChartData = () => {
  let { userOrgData, userRoleData, tagType, checkName, cardId } = data;
  let oriPieBarList = [];
  let oriLineList = [];
  if (tagType === "2") {
    // 组织 pieBarList lineList
    oriPieBarList = userOrgData.userDistributionPieList || [];
    oriLineList = userOrgData.userDistributionLineList || [];
  } else if (tagType === "3") {
    // 角色 pieBarList lineList
    if (checkName === "全部") {
      oriPieBarList = userRoleData.userDistributionPieList || []; // 返回的原始数据（包含全部，不含其他）
      oriLineList = userRoleData.userDistributionLineList || []; // 返回的原始折线图数据（包含全部，不含其他）
    } else {
      oriPieBarList = userRoleData.userDistributionPieList || []; // 返回的原始数据（包含全部，不含其他）
      oriPieBarList = oriPieBarList.filter((_) => _.name === checkName);
      oriLineList = userRoleData.userDistributionLineList || []; // 返回的原始折线图数据（包含全部，不含其他）
    }
  }
  // 过滤为0的数据
  oriPieBarList = oriPieBarList.filter((_) => _[cardId] > 0);
  // 饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  data.pieBarList = getFactortPieBarData(oriPieBarList, true);
  // 所有折线图数据
  data.lineList = getFactortLineData(oriLineList);
  console.log("pieBarList", data.pieBarList);
  console.log("lineList", data.lineList);
};
const getPieData = () => {
  let { cardId, pieBarList, colorMap } = data;
  let fieldMap = {
    dailyActiveUserCount: {
      value: "dailyActiveUserCount",
      percent: "dailyActiveUserCountRate",
    },
    monthlyActiveUserCount: {
      value: "monthlyActiveUserCount",
      percent: "monthlyActiveUserCountRate",
    },
  };

  let seriesData = pieBarList.map((_) => {
    return {
      name: _.name,
      value: _[fieldMap[cardId].value] || 0,
      percent: _[fieldMap[cardId].percent] || 0,
    };
  });

  data.activeUserOps = active_user_pie({
    seriesData,
    colorMap,
  });
};
const getBarData = () => {
  let { cardId, pieBarList, colorMap } = data;
  let xAxisData = pieBarList.map((_) => _.name);
  let seriesData = pieBarList.map((_) => _[cardId] || 0);

  data.visitNumTimeOps = visit_num_time_bar({
    xAxisData,
    seriesData,
    cardId,
    colorMap,
  });
};
const getLineData = () => {
  let { checkName, cardId, lineList, selectedData, colorMap } = data;
  let xAxisData = [];
  let seriesData = [];

  let allLineName = [checkName, ...selectedData];
  allLineName.forEach((_name) => {
    let chartObj = lineList.find((_item) => _item.name === _name) || {};
    let chartList = chartObj.chartList || [];
    xAxisData = chartList.map((_) => _.date);
    seriesData.push({
      name: _name,
      data: chartList.map((_) => _[cardId] || 0),
    });
  });

  data.userSunmaryOps = user_sunmary_line({
    xAxisData,
    seriesData,
    cardId,
    colorMap,
  });
};

// 获取饼图，折线图项数据--用于初始化
const getPieBarItem = (pieBarItem) => {
  let objectItem = JSON.parse(JSON.stringify(pieBarItem)) || {};
  for (const key in objectItem) {
    if (key === "name") {
      objectItem[key] = "";
    } else {
      objectItem[key] = 0;
    }
  }
  return objectItem;
};
// 获取柱状图项数据--用于初始化
const getLineItem = (lineItem) => {
  let objectItem = JSON.parse(JSON.stringify(lineItem)) || {};
  for (const key in objectItem) {
    if (key === "name") {
      objectItem[key] = "";
    } else if (key === "chartList") {
      objectItem[key] = objectItem[key] || [];
      objectItem[key].forEach((_item) => {
        for (const _key in _item) {
          if (_key === "name") {
            _item[_key] = "";
          } else if (_key === "date") {
            _item[_key] = _item[_key];
          } else {
            _item[_key] = 0;
          }
        }
      });
    }
  }
  return objectItem;
};

// 获取饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个
const getFactortPieBarData = (oriPieBarList, isResetColor = false) => {
  let { cardId, checkName } = data;
  let pieBarList = []; // 饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个

  oriPieBarList = deepClone(oriPieBarList);
  oriPieBarList = oriPieBarList.filter((_) => _.name !== "全部");
  // 降序
  oriPieBarList.sort((a, b) => b[cardId] - a[cardId]);

  if (isResetColor) {
    // 给每一项添加颜色，超过8个，最后一个就汇总数据为其他角色并且设置灰色
    oriPieBarList.forEach((_, idx) => {
      let colorList = getColorList();
      let color = colorList[idx];
      if (!color) {
        data.colorMap[_.name] = getRandomColorExcluding([
          ...colorList,
          "#D8D2D2",
          "#526AE7",
        ]);
      } else {
        data.colorMap[_.name] = color;
      }
    });
    data.colorMap["全部"] = "#526AE7";
    data.colorMap[checkName] = "#526AE7";
  }

  // 饼图、柱状图超过8个，填充其他数据
  if (oriPieBarList.length > data.barLineLen) {
    let extraList = oriPieBarList.slice(data.barLineLen - 1) || [];
    let pieBarItem = getPieBarItem(oriPieBarList[0] || {});
    // 注意点：折线图的其他角色数据根据饼图、柱状图的其他角色对应计算(接口返回的折线图角色与饼图、柱状图的角色数量不一致)
    // 需要剔除角色为0访问量的数据（extraList里去除）
    if (cardId === "aveVisitsNumberUba") {
      extraList = extraList.filter((_) => _.aveVisitsNumberUba > 0);
    } else if (cardId === "aveVisitsTimeUba") {
      extraList = extraList.filter((_) => _.aveVisitsTimeUba > 0);
    }

    data.extraList = extraList.map((_) => _.name);
    console.log("其他extraList", extraList);

    for (const key in pieBarItem) {
      if (key === "name") {
        pieBarItem[key] = otherName.value;
      } else {
        let fieldVal = extraList.reduce((acc, cur) => {
          return (acc || 0) - 0 + ((cur[key] || 0) - 0);
        }, 0);
        if (key === "dailyActiveUserCountRate") {
          pieBarItem[key] = parseFloat(fieldVal.toFixed(2));
        } else if (key === "monthlyActiveUserCountRate") {
          pieBarItem[key] = parseFloat(fieldVal.toFixed(2));
        } else {
          pieBarItem[key] = fieldVal;
        }
      }
    }
    console.log("pieBarItem", pieBarItem);
    pieBarItem["aveVisitsNumberUba"] = pieBarItem["dailyActiveUserCount"]
      ? pieBarItem["aveVisitsNumberUba"] / extraList.length
      : 0;
    pieBarItem["aveVisitsTimeUba"] = pieBarItem["dailyActiveUserCount"]
      ? pieBarItem["aveVisitsTimeUba"] / extraList.length
      : 0;

    if (isResetColor) {
      data.colorMap[otherName.value] = "#D8D2D2";
    }
    pieBarList = [...oriPieBarList.slice(0, data.barLineLen - 1), pieBarItem];
  } else {
    // 8个(含)以下
    pieBarList = oriPieBarList;
    data.extraList = [];
  }

  // 将其它放到最后
  moveItemToPlace(
    pieBarList,
    pieBarList.findIndex((_) => _.name === otherName.value),
    "end"
  );
  console.log("data.colorMap", data.colorMap);
  return pieBarList;
};
// 获取折线图数据--包含全部，包含其他(若超过8个)--完整数据
const getFactortLineData = (oriLineList) => {
  if (oriLineList.length === 0) return [];
  // 注意点：折线图的其他角色数据根据饼图、柱状图的其他角色对应计算(接口返回的折线图角色比饼图、柱状图的角色数量不一致)
  oriLineList = deepClone(oriLineList || []);
  let lineList = []; // 折线图数据--包含全部，包含其他角色(若超过8个)--完整数据

  // 将全部放到最前
  moveItemToPlace(
    lineList,
    lineList.findIndex((_) => _.name === "全部"),
    "start"
  );

  let extraList = [];
  oriLineList.forEach((_) => {
    if (data.extraList.includes(_.name)) {
      extraList.push(_);
    }
  });
  console.log("line-extraList", extraList);
  if (extraList.length > 0) {
    let lineItem = getLineItem(oriLineList[0] || {});
    // 折线图超过8个，填充其他角色数据
    // 将超过8个的chartList合并到一个数组中
    let extraAllChartList = extraList.reduce((acc, cur) => {
      return acc.concat(cur["chartList"] || []);
    }, []);
    let dateArr = oriLineList[0]["chartList"].map((_) => {
      return _.date; // 日期集合
    });
    let mapDateChart = {}; // {'2024-12-12': {}, '2024-12-13': {}} 汇总日期各个key的累加值
    dateArr.forEach((date) => {
      let sameDateChart = extraAllChartList.filter((_) => _.date === date); // 获取相同日期的chartList
      mapDateChart[date] = {
        dailyActiveUserCount: null,
        dailyActiveUserCountRate: null,
        monthlyActiveUserCount: null,
        monthlyActiveUserCountRate: null,
        aveVisitsNumberUba: null,
        aveVisitsTimeUba: null,
      };
      for (const key in mapDateChart[date]) {
        let sum = sameDateChart.reduce((acc, cur) => {
          return acc - 0 + (cur[key] - 0);
        }, 0);
        mapDateChart[date][key] = parseFloat(sum.toFixed(2));
      }
    });
    console.log("mapDateChart", mapDateChart);
    for (const key in lineItem) {
      if (key === "name") {
        lineItem[key] = otherName.value;
      } else if (key === "chartList") {
        lineItem[key].forEach((_item) => {
          // 遍历chartList
          for (const _key in _item) {
            // 遍历chartList中每个对象
            if (_key === "name") {
              _item[_key] = otherName.value;
            } else if (_key === "date") {
              _item[_key] = _item[_key];
            } else {
              _item[_key] = mapDateChart[_item.date][_key]; // 计算所有chartList中对应key的值(累加)
            }
          }
          _item["aveVisitsNumberUba"] = _item["dailyActiveUserCount"]
            ? _item["aveVisitsNumberUba"] / extraList.length
            : 0;
          _item["aveVisitsTimeUba"] = _item["dailyActiveUserCount"]
            ? _item["aveVisitsTimeUba"] / extraList.length
            : 0;
        });
      }
    }
    console.log("lineItem", lineItem);
    lineList = [...oriLineList, lineItem];
    console.log("lineList", lineList);
  } else {
    lineList = oriLineList;
  }
  // 将其它放到最后
  moveItemToPlace(
    lineList,
    lineList.findIndex((_) => _.name === otherName.value),
    "end"
  );
  return lineList;
};
watch(
  () => props.userData,
  (userData) => {
    if (Object.keys(userData).length <= 0) return;
    const oriSysData = deepClone(userData) || {};
    data.oriPageData = oriSysData;
    data.hasReportOrg = oriSysData.hasReportOrg === 1;
    data.hasReportRole = oriSysData.hasReportRole === 1;

    initData();
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.orgTree,
  () => {
    getCheckData();
  },
  {
    deep: true,
    immediate: true,
  }
);

// 用户维度类型切换
const handleTag = async (tag) => {
  let { tagType } = data;
  if (tagType === "3") {
    // 获取用户角色数据
    if (Object.keys(data.userRoleData).length > 0) {
      data.userRoleData = deepClone(data.oriUserRoleData);
    } else {
      data.userRoleData = await getUserAnalysisRoleData();
      data.oriUserRoleData = deepClone(data.userRoleData);
      let roleTree = data.userRoleData.userDistributionPieList || [];
      // 角色下拉列表--包含全部，不含其他角色
      data.roleTree = roleTree.map((_) => {
        _.id = _.name === "全部" ? "-1" : Math.random().toString(36);
        return _;
      });
    }
  }

  initData(false);
  nextTick(() => {
    // 滚动到顶部
    dropDownCascadeRef.value.scrollToTop();
  });
};
// 筛选切换
const checkChange = async (obj) => {
  let { tagType, checkName, oriPageData } = data;
  console.log("选中数据", obj);
  data.checkObj = obj;
  data.selectedData = [];

  if (tagType === "2") {
    // 获取当前组织及下级数据
    if (checkName === "全部") {
      data.userOrgData = oriPageData?.userAnalysis?.userAnalysisByOrg || {};
    } else {
      let name = findNodePath(props.orgTree, obj.id);
      data.userOrgData = await getDetailData({
        businessType: "operationSystemDetails",
        queryCode: "system_details_user_analysis_org",
        searchKey: name,
      });
    }
    // data.colorMap[checkName] = "#526AE7";
  } else if (tagType === "3") {
    // data.colorMap[checkName] = "#526AE7";
  }
  data.echartPieKey = Math.random() + 0;
  data.echartBarKey = Math.random() + 1;
  data.echartLineKey = Math.random() + 2;
  getCardData();
  getChartData();
  getUserTop5Data();
};
// 卡片切换
const handleCard = () => {
  data.checkObj = {};
  data.selectedData = [];

  data.echartPieKey = Math.random() + 0;
  data.echartBarKey = Math.random() + 1;
  data.echartLineKey = Math.random() + 2;
  getCheckData();
  getChartData();
  getUserTop5Data();

  nextTick(() => {
    // 滚动到顶部
    dropDownCascadeRef.value.scrollToTop();
  });
};
// 图表点击
const clickLabelEvent = (params) => {
  console.log("图表点击params", params);
  if (data.selectedData.includes(params.name)) {
    data.selectedData.splice(data.selectedData.indexOf(params.name), 1);
  } else {
    data.selectedData.push(params.name);
  }
  data.echartLineKey = Math.random() + 2;
  getLineData(); // 折线图
  console.log("selectedData", data.selectedData);
};
const scrollToPlace = (id) => {
  emits("scrollToPlace", {
    pageTitle: "用户分析",
    pageType: id,
    id,
    offsetTop: 0,
  });
};
const jumpLineDoc = () => {
  props.pageData.sheetUrl && window.open(props.pageData.sheetUrl, "_blank");
};

// 获取用户分析--角色数据
const getUserAnalysisRoleData = async () => {
  showLoadingToast({
    message: "加载中...",
    overlay: true,
    loadingType: "spinner",
    overlayClass: "overlay-toast",
    zIndex: 9999999,
    duration: 0,
  });
  let resData = await getPublicBusiness({
    businessType: "operationSystemDetails",
    queryCode: "system_details_user_analysis_role",
    dateStr: props.staticTime,
    sysCode: props.sysCode,
  })
    .then((res) => {
      if (res.code === 200) {
        closeToast();
        return res?.data?.userAnalysis?.userAnalysisByRole || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
    })
    .catch((err) => {
      console.log("err", err);
      showFailToast("接口异常");
    });

  return resData || {};
};
// 获取详情数据
const getDetailData = async (params = {}) => {
  showLoadingToast({
    message: "加载中...",
    overlay: true,
    loadingType: "spinner",
    overlayClass: "overlay-toast",
    zIndex: 9999999,
    duration: 0,
  });
  let detailData = await getPublicBusiness({
    dateStr: props.staticTime,
    sysCode: props.sysCode,
    ...params,
  })
    .then((res) => {
      if (res.code === 200) {
        closeToast();
        return res?.data?.userAnalysis?.userAnalysisByOrg || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
    })
    .catch((err) => {
      console.log("err", err);
      showFailToast("接口异常");
    });
  return detailData || {};
};
</script>

<style lang="less" scoped>
.card-analysis {
  .card-wrap {
    /deep/.com-header {
      margin-bottom: 10px;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
    }
    /deep/.user-top5-table {
      .card-title {
        padding-left: 0;
        font-size: 12px;
        color: #1d252f;
        font-weight: normal;
        &::before {
          display: none;
        }
      }
      .table-item-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: normal;
      }
    }
  }
}
</style>
