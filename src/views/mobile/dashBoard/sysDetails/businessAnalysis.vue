<template>
  <div class="card-analysis" id="businessAnalysis">
    <div v-if="isFirstTab" ref="borderLTopRef" class="border-left-top"></div>
    <div v-if="isFirstTab" ref="borderRTopRef" class="border-right-top"></div>
    <!-- 业务分析 -->
    <card-wrap
      :class="['card-wrap', { 'radius-wrap': isFirstTab }]"
      title="业务分析"
      :staticTime="staticTime"
      :img-src="require('@/assets/images/dashBoard/business.svg')"
    >
      <template #default>
        <card-main :showHeader="false" v-if="data.hasReportBusiness">
          <div class="header-box">
            <div class="header-title">设备接入情况</div>

            <!-- 筛选 -->
            <dropDownCascade
              ref="dropDownCascadeRef"
              v-model:checkId="data.checkId"
              v-model:checkName="data.checkName"
              isShowCompRadio
              :expandLevel="1"
              :checkOps="data.checkOps"
              dropType="tree"
              :headerColumn="headerColumn"
              :isNum="
                data.cardId === 'deviceOnlineRate' ||
                data.cardId === 'deviceAveOffline'
              "
              @checkChange="checkChange"
              @scrollToPlace="scrollToPlace('businessAnalysis')"
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
            v-if="
              data.cardId === 'deviceTotal' && data.deviceTotalList.length > 0
            "
            height="220"
            isTriggerEvent
            isHideTipEvent
            echartTitle="当日各类型设备数量分布"
            :opsObj="data.deviceCountOps"
            :selectedData="data.selectedData"
            :key="data.echartCountKey"
            @clickLabelEvent="clickLabelEvent"
          ></echart-bar>

          <echart-bar
            v-if="
              data.cardId === 'deviceOnlineRate' &&
              data.deviceOnlineRateList.length > 0
            "
            height="190"
            isTriggerEvent
            isHideTipEvent
            xLabelInAxis
            :xLabelInAxisLen="11"
            echartTitle="当日各类型设备在离线情况"
            :opsObj="data.deviceOnlineOps"
            :selectedData="data.selectedData"
            :key="data.echartOnlineKey"
            @clickLabelEvent="clickLabelEvent"
          >
            <template #subTitleHead>
              <div class="sub-title-head">
                <span>设备数</span>
                <span>在线率</span>
              </div>
            </template>
          </echart-bar>

          <echart-bar
            v-if="
              data.cardId === 'deviceAveOffline' &&
              data.deviceAveOfflineList.length > 0
            "
            height="190"
            isTriggerEvent
            isHideTipEvent
            xLabelInAxis
            :xLabelInAxisLen="11"
            echartTitle="当日各类型设备离线次数"
            :opsObj="data.deviceAvgOfflineOps"
            :selectedData="data.selectedData"
            :key="data.echartOfflineKey"
            showTip
            tipTxt="专门用于统计设备离线的频次，特指一天内设备离线的具体次数。该指标对于反映设备连接的稳定性具有重要意义，若某一设备的离线次数较为频繁，意味着其在连接过程中反复重连且状态不稳定。"
            @clickLabelEvent="clickLabelEvent"
          >
          </echart-bar>

          <echart-bar
            v-if="
              data.cardId === 'deviceMsgTotal' &&
              data.deviceMsgTotalList.length > 0
            "
            height="220"
            isTriggerEvent
            isHideTipEvent
            echartTitle="当日各类型设备消息数分布"
            :opsObj="data.deviceMsgOps"
            :selectedData="data.selectedData"
            :key="data.echartMsgKey"
            showTip
            tipTxt="鉴于Unilink系统响应式（事件驱动）的特性，设备消息数成为系统压力与成本的关键指标之一。通过该指标，可直观地反映出消息量较大的设备类型，为系统的运行状态评估提供了重要依据。"
            @clickLabelEvent="clickLabelEvent"
          >
          </echart-bar>
        </card-main>

        <!-- 是否展示业务数据 -->
        <div class="no-data-box" v-if="isFinished && !data.hasReportBusiness">
          <span>未接入业务数据</span>
          <img :src="data.noDataImg" alt="" />
        </div>
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
import cardWrap from "../components/cardWrap.vue";
import cardMain from "../components/cardMain.vue";
import dropDownCascade from "./components/dropDownCascade.vue";
import cardTypeBox from "./components/cardTypeBox.vue";
import echartBar from "@/components/EchartBar.vue";
import { moveItemToPlace, findNodePath, deepClone } from "@/common/utils/comm";
import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showLoadingToast, showFailToast, closeToast } from "vant";
import {
  device_count_pie,
  device_online_rate_bar,
  device_avg_offline_bar,
  device_msg_pie,
  business_trend_line,
  getColorList,
  getRandomColorExcluding,
} from "./config";

defineOptions({
  inheritAttrs: false,
});
const { proxy } = getCurrentInstance();
const props = defineProps({
  staticTime: {
    type: String,
    default: "",
  },
  sysCode: {
    type: String,
    default: "",
  },
  // 业务分析数据
  businessData: {
    type: Object,
    default: () => {},
  },
  // 设备级联树
  deviceTree: {
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
  cardId: "deviceTotal",
  cardList: [
    {
      id: "deviceTotal",
      name: "总设备数",
      value: null,
      unit: "个",
      rateVal: null,
      rateUnit: "个",
      tip: "指当日所有状态（在线设备数+离线设备数+禁用设备数）的设备总数。",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "deviceOnlineRate",
      name: "设备在线率",
      value: null,
      unit: "%",
      rateVal: null,
      tip: "在特定时点获取各类型设备的在线状态，计算设备的在线率，反映设备的活跃度特征。<br/>设备在线率=在线设备数/(设备总数-禁用设备数)",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "deviceAveOffline",
      name: "平均离线次数",
      value: null,
      unit: "次",
      rateVal: null,
      rateUnit: "次",
      tip: "指当日设备平均离线的次数，反映设备连接的稳定性。<br/>平均离线次数=离线消息数/（设备总数-禁用设备数）",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      showPopover: false,
    },
    {
      id: "deviceMsgTotal",
      name: "总消息数",
      value: null,
      unit: "条",
      rateVal: null,
      tip: "指当日各类型设备消息的总数。",
      rateTxt: "较上日",
      showUnit: true,
      isNumThousand: true,
      isParseUnit: true,
      showPopover: false,
    },
  ],

  checkId: "-1",
  checkName: "全部",
  checkOps: [],
  checkObj: {}, // 下拉选中数据

  oriDeviceData: [], // 原始设备数据
  deviceData: [], // 设备数据--当前节点及下级子节点数据
  deviceTotalList: [], // 设备总数数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  deviceOnlineRateList: [], // 设备在线率数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  deviceAveOfflineList: [], // 设备平均离线次数数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  deviceMsgTotalList: [], // 设备消息数数据--不含全部，包含其他(若超过8个)--总长度不超过8个

  lineList: [], // 折线图数据--包含全部、不含其他

  selectedData: [], // 饼图点击后的缓存数据，用于饼图点击事件（可选择可取消）
  deviceCountOps: device_count_pie(), // 总设备数分布，总消息数分布饼图
  deviceOnlineOps: device_online_rate_bar(), // 设备在线率柱状图
  deviceAvgOfflineOps: device_avg_offline_bar(), // 平均离线次数柱状图
  deviceMsgOps: device_msg_pie(), // 总消息数分布饼图
  userSunmaryOps: business_trend_line(), // 近30日趋势图

  colorMap: {}, // 图表颜色盘（汇总蓝色，超过8个合并为其他角色灰色）
  echartCountKey: Math.random().toString(36),
  echartOnlineKey: Math.random().toString(36),
  echartOfflineKey: Math.random().toString(36),
  echartMsgKey: Math.random().toString(36),
  echartLineKey: Math.random().toString(36),
  barLineLen: 8, // 默认显示多少个图表数据
  extraList: [], // 其他角色名称集合
  hasReportBusiness: true, // 是否展示业务数据
  noDataImg: require("@/assets/images/not-data.svg"),
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
      lable: "设备类型",
      prop: "name",
    },
    {
      lable:
        data.cardId === "deviceTotal"
          ? "设备数(个)"
          : data.cardId === "deviceOnlineRate"
          ? "设备在线率(%)"
          : data.cardId === "deviceAveOffline"
          ? "平均离线次数(次)"
          : data.cardId === "deviceMsgTotal"
          ? "消息数(条)"
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
    const titleMap = {
      line: {
        deviceTotal: "总设备数趋势",
        deviceOnlineRate: "在线率趋势",
        deviceAveOffline: "平均离线次数趋势",
        deviceMsgTotal: "总消息数趋势",
      },
    };
    return titleMap[echartType][data.cardId] || "";
  };
});
// 其他名称
const otherName = computed(() => {
  return "其他";
});

const initData = async () => {
  data.checkName = "全部";
  data.checkId = "-1";
  data.checkOps = [];
  data.checkObj = {};
  data.selectedData = [];
  data.echartCountKey = Math.random().toString(36);
  data.echartOnlineKey = Math.random().toString(36);
  data.echartOfflineKey = Math.random().toString(36);
  data.echartMsgKey = Math.random().toString(36);
  data.echartLineKey = Math.random().toString(36);
  if (data.checkName === "全部") {
    data.deviceData = data.oriDeviceData;
  }

  getCheckData();
  getCardData();
  getChartData();
};
const getCheckData = () => {
  data.checkOps = deepClone(props.deviceTree);
  data.checkOps.forEach((_) => {
    _.value = _[data.cardId];
  });
};
const getCardData = () => {
  const { deviceData } = data;
  const checkObj = deviceData.deviceAccessInfo || {};
  data.cardList[0].value = checkObj.deviceTotal;
  data.cardList[0].rateVal = checkObj.deviceTotalCompare;
  data.cardList[1].value = checkObj.deviceOnlineRate;
  data.cardList[1].rateVal = checkObj.deviceOnlineRateCompare;
  data.cardList[2].value = checkObj.deviceAveOffline;
  data.cardList[2].rateVal = checkObj.deviceAveOfflineCompare;
  data.cardList[3].value = checkObj.deviceMsgTotal;
  data.cardList[3].rateVal = checkObj.deviceMsgTotalCompare;
};

const getChartData = () => {
  factoryChartData(); // 加工图表数据
  const {
    cardId,
    deviceTotalList,
    deviceOnlineRateList,
    deviceAveOfflineList,
    deviceMsgTotalList,
    colorMap,
  } = data;

  if (cardId === "deviceTotal") {
    data.deviceCountOps = device_count_pie({
      seriesData: deviceTotalList,
      colorMap,
    });
  } else if (cardId === "deviceOnlineRate") {
    let xAxisData = deviceOnlineRateList.map((_) => _.name);
    let seriesData = deviceOnlineRateList.map((item) => {
      return {
        ...item,
        name: item.name,
        value: item.deviceTotal || 0,
      };
    });
    let seriesData2 = deviceOnlineRateList.map((item) => {
      return {
        ...item,
        name: item.name,
        value: item.value || 0,
      };
    });

    data.deviceOnlineOps = device_online_rate_bar({
      xAxisData,
      seriesData,
      seriesData2,
      colorMap,
    });
  } else if (cardId === "deviceAveOffline") {
    let xAxisData = deviceAveOfflineList.map((_) => _.name);
    let seriesData = deviceAveOfflineList.map((_) => _.value || 0);
    data.deviceAvgOfflineOps = device_avg_offline_bar({
      xAxisData,
      seriesData,
      colorMap,
    });
  } else if (cardId === "deviceMsgTotal") {
    data.deviceMsgOps = device_msg_pie({
      seriesData: deviceMsgTotalList,
      colorMap,
    });
  }

  getLineData(); // 折线图
};
// 加工图表数据
const factoryChartData = () => {
  const { deviceData, cardId } = data;
  const deviceTotalList = deviceData?.deviceTotalPieList || [];
  const deviceOnlineRateList = deviceData?.deviceOnlineRatePieList || [];
  const deviceAveOfflineList = deviceData?.deviceAveOfflinePieList || [];
  const deviceMsgTotalList = deviceData?.deviceMsgTotalPieList || [];

  if (cardId === "deviceTotal") {
    data.deviceTotalList = getFactortPieBarData(deviceTotalList, true);
    data.lineList = getFactortLineData(deviceData?.deviceTotalLineList || []);
  } else if (cardId === "deviceOnlineRate") {
    data.deviceOnlineRateList = getFactortPieBarData(
      deviceOnlineRateList,
      true
    );
    data.lineList = getFactortLineData(
      deviceData?.deviceOnlineRateLineList || []
    );
  } else if (cardId === "deviceAveOffline") {
    data.deviceAveOfflineList = getFactortPieBarData(
      deviceAveOfflineList,
      true
    );
    data.lineList = getFactortLineData(
      deviceData?.deviceAveOfflineLineList || []
    );
  } else if (cardId === "deviceMsgTotal") {
    data.deviceMsgTotalList = getFactortPieBarData(deviceMsgTotalList, true);
    data.lineList = getFactortLineData(
      deviceData?.deviceMsgTotalLineList || []
    );
  }
};

const getLineData = () => {
  let { checkName, cardId, selectedData, lineList, colorMap } = data;
  let xAxisData = [];
  let seriesData = [];

  let allLineName = [checkName, ...selectedData];
  allLineName.forEach((_name) => {
    let chartObj = lineList.find((_item) => _item.name === _name) || {};
    let chartList = chartObj.chartList || [];
    xAxisData = chartList.map((_) => _.name);
    seriesData.push({
      name: _name,
      data: chartList.map((_) => _.value || 0),
    });
  });
  console.log("getLineData-->seriesData", seriesData);

  data.userSunmaryOps = business_trend_line({
    xAxisData,
    seriesData,
    colorMap,
    cardId,
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
  let { cardId } = data;
  let pieBarList = []; // 饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个

  oriPieBarList = deepClone(oriPieBarList);
  oriPieBarList = oriPieBarList.filter((_) => _.name !== "全部");
  // 降序
  oriPieBarList.sort((a, b) => b.value - a.value);

  if (isResetColor) {
    // 给每一项添加颜色，超过8个，最后一个就汇总数据为其他并且设置灰色
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
  }

  // 饼图、柱状图超过8个，填充其他数据
  if (oriPieBarList.length > data.barLineLen) {
    let extraList = oriPieBarList.slice(data.barLineLen - 1) || [];
    let pieBarItem = getPieBarItem(oriPieBarList[0] || {});
    // 注意点：折线图的其他数据根据饼图、柱状图的其他对应计算(接口返回的折线图设备数量与饼图、柱状图的设备数量不一致)

    data.extraList = extraList.map((_) => _.name);
    console.log("其他extraList", extraList);

    for (const key in pieBarItem) {
      if (key === "name") {
        pieBarItem[key] = otherName.value;
      } else {
        let fieldVal = extraList.reduce((acc, cur) => {
          return (acc || 0) - 0 + ((cur[key] || 0) - 0);
        }, 0);
        pieBarItem[key] = parseFloat(fieldVal.toFixed(2));
      }
    }
    console.log("pieBarItem", pieBarItem);

    if (cardId === "deviceOnlineRate") {
      // 设备在线率=在线设备数/(设备总数-禁用设备数)
      let deviceOnlineRate = 0;
      if (pieBarItem.deviceTotal - pieBarItem.deviceDisable > 0) {
        deviceOnlineRate =
          (pieBarItem.deviceOnline /
            (pieBarItem.deviceTotal - pieBarItem.deviceDisable)) *
          100;
      }
      pieBarItem.value = parseFloat(deviceOnlineRate.toFixed(2)) || 0;
    } else if (cardId === "deviceAveOffline") {
      // 平均离线次数=离线消息数/（设备总数-禁用设备数）
      let deviceAveOffline = 0;
      if (pieBarItem.deviceTotal - pieBarItem.deviceDisable > 0) {
        deviceAveOffline =
          pieBarItem.deviceOfflineMsg /
          (pieBarItem.deviceTotal - pieBarItem.deviceDisable);
      }
      pieBarItem.value = parseFloat(deviceAveOffline.toFixed(2)) || 0;
    }

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
  let { cardId } = data;
  if (oriLineList.length === 0) return [];
  // 注意点：折线图的其他数据根据饼图、柱状图的其他对应计算(接口返回的折线图设备数量与饼图、柱状图的设备数量不一致)
  oriLineList = deepClone(oriLineList || []);
  let lineList = []; // 折线图数据--包含全部，包含其他(若超过8个)--完整数据

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

    // 折线图超过8个，填充其他数据
    // 将超过8个的chartList合并到一个数组中
    let extraAllChartList = extraList.reduce((acc, cur) => {
      return acc.concat(cur["chartList"] || []);
    }, []);
    let dateArr = oriLineList[0]["chartList"].map((_) => {
      return _.name; // 日期集合
    });
    console.log("dateArr", dateArr);

    let mapDateChart = {}; // {'2024-12-12': {}, '2024-12-13': {}} 汇总日期各个key的累加值
    dateArr.forEach((date) => {
      let sameDateChart = extraAllChartList.filter((_) => _.name === date); // 获取相同日期的chartList
      mapDateChart[date] = {
        value: 0,
        valueRate: 0,
        deviceOnline: 0, // 在线设备数
        deviceTotal: 0, // 设备总数
        deviceDisable: 0, // 禁用设备数
        deviceOfflineMsg: 0, // 离线消息数
      };
      for (const key in mapDateChart[date]) {
        let sum = sameDateChart.reduce((acc, cur) => {
          return acc - 0 + (cur[key] || 0 - 0);
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
          let date = _item.name;
          // 遍历chartList
          for (const _key in _item) {
            // 遍历chartList中每个对象
            if (_key === "name") {
              _item[_key] = date;
            } else {
              _item[_key] = mapDateChart[date][_key]; // 计算所有chartList中对应key的值(累加)
            }
          }

          if (cardId === "deviceOnlineRate") {
            let deviceOnlineRate = 0;
            // 设备在线率=在线设备数/(设备总数-禁用设备数)
            if (_item.deviceTotal - _item.deviceDisable > 0) {
              deviceOnlineRate =
                (_item.deviceOnline /
                  (_item.deviceTotal - _item.deviceDisable)) *
                100;
            }
            _item.value = parseFloat(deviceOnlineRate.toFixed(2)) || 0;
          } else if (cardId === "deviceAveOffline") {
            // 平均离线次数=离线消息数/（设备总数-禁用设备数）
            let deviceAveOffline = 0;
            if (_item.deviceTotal - _item.deviceDisable > 0) {
              deviceAveOffline =
                _item.deviceOfflineMsg /
                (_item.deviceTotal - _item.deviceDisable);
            }
            _item.value = parseFloat(deviceAveOffline.toFixed(2)) || 0;
          }
        });
      }
    }
    lineList = [...oriLineList, lineItem];
    console.log("lineItem", lineItem);
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
  () => props.businessData,
  (businessData) => {
    if (Object.keys(businessData).length <= 0) return;
    const oriDeviceData = deepClone(businessData) || {};
    data.oriDeviceData = oriDeviceData;
    data.hasReportBusiness = oriDeviceData.hasReportBusiness === 1;

    initData();
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.deviceTree,
  () => {
    getCheckData();
  },
  {
    deep: true,
    immediate: true,
  }
);

// 筛选切换
const checkChange = async (obj) => {
  console.log("选中数据", obj);
  data.checkObj = obj;
  data.selectedData = [];

  // 获取当前组织及下级数据
  if (data.checkName === "全部") {
    data.deviceData = data.oriDeviceData;
  } else {
    const searchKey = findNodePath(props.deviceTree, obj.id);
    data.deviceData = await getDetailData({
      businessType: "operationSystemDetails",
      queryCode: "system_details_business_analysis",
      searchKey,
    });
  }
  console.log("data.deviceData", data.deviceData);
  data.colorMap[data.checkName] = "#526AE7";
  data.echartCountKey = Math.random().toString(36);
  data.echartOnlineKey = Math.random().toString(36);
  data.echartOfflineKey = Math.random().toString(36);
  data.echartMsgKey = Math.random().toString(36);
  data.echartLineKey = Math.random().toString(36);
  getCardData();
  getChartData();
};
// 卡片切换
const handleCard = () => {
  data.checkObj = {};
  data.selectedData = [];

  data.echartCountKey = Math.random().toString(36);
  data.echartOnlineKey = Math.random().toString(36);
  data.echartOfflineKey = Math.random().toString(36);
  data.echartMsgKey = Math.random().toString(36);
  data.echartLineKey = Math.random().toString(36);
  getCheckData();
  getChartData();

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
  data.echartLineKey = Math.random().toString(36);
  getLineData(); // 折线图
  console.log("selectedData", data.selectedData);
};
const scrollToPlace = (id) => {
  emits("scrollToPlace", {
    pageTitle: "业务分析",
    pageType: id,
    id,
    offsetTop: 0,
  });
};

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
        return res?.data?.businessAnalysis || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
    })
    .catch((err) => {
      console.log("err", err);
    });
  closeToast();
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
      align-items: center;
      padding-left: 11px;
      position: relative;
      .header-title {
        font-size: 14px;
        color: #1d252f;
        font-weight: 700;
      }
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 5px;
        height: 12px;
        border-radius: 5px;
        background: #526ae7;
      }
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
    .sub-title-head {
      display: flex;
      justify-content: space-between;
      color: #73757e;
      font-size: 10px;
    }
  }
}
</style>
