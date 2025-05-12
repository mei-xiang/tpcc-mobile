<template>
  <div class="card-analysis" id="pageViewAnalysis">
    <div v-if="isFirstTab" ref="borderLTopRef" class="border-left-top"></div>
    <div v-if="isFirstTab" ref="borderRTopRef" class="border-right-top"></div>
    <!-- 系统分析 -->
    <card-wrap
      :class="['card-wrap', { 'radius-wrap': isFirstTab }]"
      title="系统分析"
      :staticTime="staticTime"
      :img-src="require('@/assets/images/dashBoard/page-view.svg')"
    >
      <template #default>
        <card-main :showHeader="false" v-if="data.hasReportMenu">
          <div class="header-box">
            <!-- 维度类型 -->
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
              :expandLevel="data.tagType === '2' ? 2 : 1"
              :checkOps="data.checkOps"
              :dropType="data.tagType === '3' ? 'select' : 'tree'"
              :headerColumn="[
                {
                  lable:
                    data.tagType === '1'
                      ? '菜单名称'
                      : data.tagType === '2'
                      ? '组织名称'
                      : data.tagType === '3'
                      ? '角色名称'
                      : '',
                  prop: 'name',
                },
                {
                  lable: '总浏览量(次)',
                  prop: 'value',
                  minWidth: $px2rem('84'),
                  headerAlign: 'right',
                },
              ]"
              @checkChange="checkChange"
              @scrollToPlace="scrollToPlace('pageViewAnalysis')"
            ></dropDownCascade>
          </div>

          <card-data :fieldList="data.fieldList"></card-data>

          <template v-if="is_report">
            <echart-bar
              v-if="is_show_echart"
              echartDom="typeVisitDistributeDom"
              height="190"
              isHideTipEvent
              isTriggerEvent
              isHideTriggerHigh
              :key="data.echartBarKey"
              :echartTitle="data.echartTitle"
              :opsObj="data.echartOps"
              @clickLabelEvent="clickLabelEvent($event, 1)"
            ></echart-bar>
          </template>
          <!-- 未推送组织、未推送角色 -->
          <div class="no-data-box" v-if="isFinished && !is_report">
            <span v-if="data.tagType === '2' && !data.hasReportOrg">
              暂无组织分布数据
            </span>
            <span v-else-if="data.tagType === '3' && !data.hasReportRole">
              暂无角色分布数据
            </span>
            <img :src="data.noDataImg" alt="" />
          </div>

          <card-table
            :topTable="data.commonData"
            title="常用功能"
            unit="（浏览量：次）"
          ></card-table>
          <card-table
            v-show="is_show_org_table"
            :topTable="data.orgData"
            title="常用组织"
            unit="（浏览量：次）"
          ></card-table>
          <card-table
            v-show="is_show_role_table"
            :topTable="data.roleData"
            title="常用角色"
            unit="（浏览量：次）"
          ></card-table>
        </card-main>
        <!-- 菜单层级未上报到埋点平台 -->
        <div class="no-data-box" v-if="isFinished && !data.hasReportMenu">
          <span>菜单层级未上报到埋点平台</span>
          <img :src="data.noDataImg" alt="" />
        </div>

        <div v-if="isFinished && data.hasReportTimeSpan">
          <div class="header-box">
            <div class="title-name">各时段浏览量分布</div>
          </div>
          <card-data :fieldList="data.sysVisitsFieldList"></card-data>
          <echart-bar
            height="190"
            isHideTipEvent
            echartDom="sysVisitDistributeDom"
            :opsObj="data.sysVisitsOps"
            key="sysVisitDistributeDom"
          ></echart-bar>
        </div>

        <div v-if="isFinished">
          <div
            class="header-box sys-res-box"
            v-if="data.hasFirstScreenTime || data.hasPageResponseTime"
          >
            <div class="title-name">系统响应时间</div>
          </div>

          <div v-if="data.hasFirstScreenTime">
            <div class="header-box circle-box">
              <div class="title-name">
                <span>首屏加载时间</span>
                <tipBox showTip>
                  <template #tipTxt>
                    <div class="popover-content">
                      <div>
                        <span class="font-bold">首屏加载时间：</span>
                        <span
                          >是指用户首次进入系统从请求页面开始到页面完全加载完成的时间，包括所有资源（如图片、样式表、脚本等）和页面数据都加载完；</span
                        >
                      </div>
                      <div>
                        <span class="font-bold">前端加载时间：</span>
                        <span>
                          前端资源（如图片、样式表、脚本等）加载完成时间；
                        </span>
                      </div>
                      <div>
                        <span class="font-bold">后端请求时间：</span>
                        <span
                          >本处是指首屏加载时间与前端加载时间的差值，剔除了与前端加载并行的时间。</span
                        >
                      </div>
                    </div>
                  </template>
                </tipBox>
              </div>
            </div>
            <div>
              <card-data :fieldList="data.fScreenLoadField"></card-data>
              <van-row>
                <van-col :span="$isPCBrowser ? 12 : 14">
                  <span>平均加载时间分析</span>
                  <!-- echartTitle="平均加载时间分析" -->
                  <echart-bar
                    height="130"
                    isHideTipEvent
                    echartDom="fScreenLoadDom"
                    :opsObj="data.fScreenLoadPieOps"
                    key="fScreenLoadDom"
                  ></echart-bar
                ></van-col>
                <van-col :span="$isPCBrowser ? 12 : 10">
                  <page-analysis-card :fScreenLoadTime="data.fScreenLoadTime">
                  </page-analysis-card>
                </van-col>
              </van-row>
            </div>
          </div>

          <div v-if="data.hasPageResponseTime">
            <div class="header-box circle-box" id="sysResHeaderBox">
              <div class="title-name">
                <span>页面响应时间</span>
                <tipBox showTip>
                  <template #tipTxt>
                    <div class="popover-content">
                      <div>
                        <span>
                          是指从用户请求页面开始到页面完全加载完成的时间，包括所有资源（如图片、样式表、脚本等）和页面数据都加载完。
                        </span>
                      </div>
                    </div>
                  </template>
                </tipBox>
              </div>
              <dropDownCascade
                ref="dropDownCascadeRef"
                v-model:checkId="data.sysPageCheckId"
                v-model:checkName="data.sysPageCheckName"
                :checkOps="menuTree"
                dropType="tree"
                rightName="平均(秒)"
                :headerColumn="[
                  {
                    lable: '菜单名称',
                    prop: 'name',
                  },
                  {
                    lable: '平均(秒)',
                    prop: 'avgResponseTime',
                    minWidth: $px2rem('60'),
                    isToSecond: true,
                    headerAlign: 'center',
                  },
                  {
                    lable: '最长(秒)',
                    prop: 'maxResponseTime',
                    minWidth: $px2rem('60'),
                    isToSecond: true,
                    headerAlign: 'center',
                  },
                ]"
                @checkChange="checkSysResChange"
                @scrollToPlace="scrollToPlace('sysResHeaderBox')"
              ></dropDownCascade>
            </div>
            <card-data :fieldList="data.sysPageFieldList"></card-data>
            <echart-bar
              v-if="is_show_sys_page_echart"
              height="190"
              isHideTipEvent
              isTriggerEvent
              isHideTriggerHigh
              echartDom="sysResDom"
              echartTitle="各功能平均响应时间"
              :opsObj="data.sysPageResOps"
              @clickLabelEvent="clickLabelEvent($event, 2)"
              key="sysResDom"
            ></echart-bar>
          </div>
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
  computed,
  defineEmits,
  defineProps,
  onMounted,
  getCurrentInstance,
} from "vue";
import cardWrap from "../components/cardWrap.vue";
import cardMain from "../components/cardMain.vue";
import cardData from "../components/cardData.vue";
import tagBox from "./components/tagBox.vue";
import cardTable from "./components/cardTable.vue";
import dropDownCascade from "./components/dropDownCascade.vue";
import tipBox from "./components/tipBox.vue";
import pageAnalysisCard from "./components/pageAnalysisCard.vue";
import echartBar from "@/components/EchartBar.vue";
import {
  sys_visits_distribute,
  type_visits_distribute,
  fscreen_load_pie,
  sys_menu_res_time,
} from "./config";
import {
  numThousand,
  runeMenuTree,
  findNodeById,
  findNodePath,
  deepClone,
} from "@/common/utils/comm";
import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showLoadingToast, showFailToast, closeToast } from "vant";

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
  sysData: {
    type: Object,
    default: () => {},
  },
  // 菜单级联树
  menuTree: {
    type: Array,
    default: () => [],
  },
  // 组织级联树
  orgTree: {
    type: Array,
    default: () => [],
  },
  // 角色级联树
  roleTree: {
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
  tagType: "1",
  tagList: [
    {
      name: "按菜单",
      type: "1",
    },
    {
      name: "按组织",
      type: "2",
    },
    {
      name: "按角色",
      type: "3",
    },
  ],

  oriSysData: [], // 原始系统数据
  pageAnalysisMenu: {},
  pageAnalysisOrg: {},
  pageAnalysisRole: {},
  timeSpanVisits: {},
  fScreenLoadTime: {},
  sysPageResTime: {},

  checkId: "-1",
  checkName: "全部",
  checkOps: [],
  checkObj: {}, // 选中数据
  fieldList: [
    {
      name: "浏览量",
      val: null,
      floatVal: null,
      unit: "次",
    },
    {
      name: "浏览人数",
      val: null,
      floatVal: null,
      unit: "人",
      isHideFloat: true,
    },
  ],

  echartTitle: "",
  barLineLen: 8, // 默认显示多少个图表数据
  echartBarKey: Math.random() + 1,
  echartOps: type_visits_distribute(),

  // 各时段浏览量分布
  sysVisitsOps: sys_visits_distribute(),
  topData: [], // TOP2数据
  sysVisitsFieldList: [
    {
      name: "浏览量",
      val: null,
      floatVal: null,
      unit: "次",
    },
    {
      name: "高峰期",
      val: null,
      floatVal: null,
      unit: "",
      isHideFloat: true,
    },
  ],

  // 首屏加载
  fScreenLoadField: [
    {
      name: "首屏平均加载时间",
      val: null,
      floatVal: null,
      unit: "秒",
      floatUnit: "秒",
      isShowSecond: true,
    },
    {
      name: "首屏最长加载时间",
      val: null,
      floatVal: null,
      unit: "秒",
      floatUnit: "秒",
      isShowSecond: true,
    },
  ],
  fScreenLoadPieOps: fscreen_load_pie(),

  // 页面响应
  sysPageCheckId: "-1",
  sysPageCheckName: "全部",
  sysPageResCheckObj: {},
  sysPageFieldList: [
    {
      name: "页面平均响应时间",
      val: null,
      floatVal: null,
      unit: "秒",
      floatUnit: "秒",
      isShowSecond: true,
    },
    {
      name: "页面最长响应时间",
      val: null,
      floatVal: null,
      unit: "秒",
      floatUnit: "秒",
      isShowSecond: true,
    },
  ],
  sysPageResOps: sys_menu_res_time(),

  commonData: [],
  orgData: [],
  roleData: [],

  noDataImg: require("@/assets/images/not-data.svg"),
  hasReportMenu: true, // 是否推送菜单数据
  hasReportOrg: true, // 是否推送组织数据
  hasReportRole: true, // 是否推送角色数据
  hasReportTimeSpan: true, // 是否推送访问时段数据
  hasFirstScreenTime: true, // 是否推送首屏加载时间数据
  hasPageResponseTime: true, // 是否推送页面响应时间数据
});

onMounted(() => {
  if (proxy.$isIphone) {
    borderLTopRef.value && (borderLTopRef.value.style.display = "none");
    borderRTopRef.value && (borderRTopRef.value.style.display = "none");
  }
});

// 是否显示图表
const is_show_echart = computed(() => {
  let { tagType, checkName, checkObj } = data;
  let isShow = true;
  if (tagType === "1") {
    if (
      checkName !== "全部" &&
      (!checkObj.children || checkObj.children.length === 0)
    ) {
      isShow = false;
    }
  } else if (tagType === "2") {
    // 外部组织、叶子节点不显示图表
    if (
      checkName === "外部组织" ||
      (checkName !== "全部" &&
        (!checkObj.children || checkObj.children.length === 0))
    ) {
      isShow = false;
    }
  } else if (tagType === "3") {
    if (checkName !== "全部") {
      isShow = false;
    }
  }
  return isShow;
});
// 是否显示页面响应时间图表
const is_show_sys_page_echart = computed(() => {
  let { sysPageCheckName, sysPageResCheckObj } = data;
  let isShow = true;
  if (
    sysPageCheckName !== "全部" &&
    (!sysPageResCheckObj.children || sysPageResCheckObj.children.length === 0)
  ) {
    isShow = false;
  }
  return isShow;
});
// 是否推送组织和角色数据，未推送显示暂无数据图片
const is_report = computed(() => {
  let { tagType, hasReportOrg, hasReportRole } = data;
  let show = true;
  if (tagType === "1") {
    show = true;
  } else if (tagType === "2") {
    if (!hasReportOrg) {
      show = false;
    }
  } else if (tagType === "3") {
    if (!hasReportRole) {
      show = false;
    }
  }
  return show;
});

// 是否显示常用组织--按组织是叶子节点不显示
const is_show_org_table = computed(() => {
  let { tagType, checkName, checkObj } = data;
  let show = true;
  if (
    tagType === "2" &&
    checkName !== "全部" &&
    (!checkObj.children || checkObj.children.length === 0)
  ) {
    show = false;
  }
  return show;
});

// 是否显示常用角色--按角色时非全部不显示
const is_show_role_table = computed(() => {
  let { tagType, checkName } = data;
  let show = true;
  if (tagType === "3" && checkName !== "全部") {
    show = false;
  }
  return show;
});

// 初始化数据 isFirstLoad:是否第一次加载。isTagToggle:是否手动tag切换--用于loading加载
const initData = async (isFirstLoad = true, isTagToggle = false) => {
  let { tagType, oriSysData } = data;
  data.checkName = "全部";
  data.checkId = "-1";
  data.checkOps = [];
  if (data.checkName === "全部") {
    data.pageAnalysisMenu = oriSysData.pageAnalysisMenu || {};
    data.pageAnalysisOrg = oriSysData.pageAnalysisOrg || {};
    data.pageAnalysisRole = oriSysData.pageAnalysisRole || {};
    data.timeSpanVisits = oriSysData.timeSpanVisits || {};
  }

  if (tagType === "1") {
    data.echartTitle = "当日各功能浏览量";
  } else if (tagType === "2") {
    data.echartTitle = "当日各组织浏览量";
  } else if (tagType === "3") {
    data.echartTitle = "当日各角色浏览量";
  }

  await getCheckData(isTagToggle);

  // 第一次加载
  if (isFirstLoad) {
    // 各时段浏览量
    getTimeSpanVisits();
    // 首屏加载时间
    getFScreenLoadTime();
    // 页面响应时间
    getSysResTime();
  }

  getCardData();
  getChartData();
  getTableData();
};
const getCheckData = async (isTagToggle = false) => {
  let { tagType } = data;
  if (isTagToggle) {
    showLoadingToast({
      message: "加载中...",
      overlay: true,
      loadingType: "spinner",
      overlayClass: "overlay-toast",
      zIndex: 9999999,
      duration: 0,
    });
  }
  if (tagType === "1") {
    data.checkOps = props.menuTree;
    // data.checkOps = runeMenuTree(data.checkOps, 4); // 菜单级联树截取到四级
    console.log("菜单树", data.checkOps);
  } else if (tagType === "2") {
    data.checkOps = props.orgTree;
    // alert(1);
    console.log("组织树", data.checkOps);
  } else if (tagType === "3") {
    data.checkOps = props.roleTree;
    console.log("角色树", data.checkOps);
  }
  if (isTagToggle) {
    closeToast();
  }
};
const getCardData = () => {
  let { tagType, pageAnalysisMenu, pageAnalysisOrg, pageAnalysisRole } = data;
  if (tagType === "1") {
    console.log("pageAnalysisMenu", pageAnalysisMenu);
    data.fieldList[0].val = numThousand(pageAnalysisMenu.visitNumber);
    data.fieldList[0].floatVal = pageAnalysisMenu.visitsNumberFront;
    data.fieldList[1].val = numThousand(pageAnalysisMenu.dailyActiveUserCount);
  } else if (tagType === "2") {
    console.log("pageAnalysisOrg", pageAnalysisOrg);
    data.fieldList[0].val = numThousand(pageAnalysisOrg.visitNumber);
    data.fieldList[0].floatVal = pageAnalysisOrg.visitsNumberFront;
    data.fieldList[1].val = numThousand(pageAnalysisOrg.dailyActiveUserCount);
  } else if (tagType === "3") {
    console.log("pageAnalysisRole", pageAnalysisRole);
    data.fieldList[0].val = numThousand(pageAnalysisRole.visitNumber);
    data.fieldList[0].floatVal = pageAnalysisRole.visitsNumberFront;
    data.fieldList[1].val = numThousand(pageAnalysisRole.dailyActiveUserCount);
  }
};
const getTopData = (data = [], num = 2) => {
  if (data.length === 0) return [];
  let topData = deepClone(data)
    .sort((a, b) => b - a)
    .slice(0, num);
  let resData = [];
  for (let i = 0; i < data.length; i++) {
    const el = data[i];
    for (let j = 0; j < topData.length; j++) {
      const _el = topData[j];
      if (el === _el) {
        resData.push({
          index: i,
          value: _el,
        });
        break;
      }
    }
  }
  resData.sort((a, b) => b.value - a.value); // 降序
  resData.forEach((i, idx) => {
    if (idx === 0) {
      i.top1 = true;
    }
  });
  return resData;
};
// 获取系统访问分布图表数据
const getSysChartData = () => {
  let { timeSpanVisits } = data;
  let visitDistributionList = timeSpanVisits.visitDistributionList || [];
  visitDistributionList =
    visitDistributionList.length > 0
      ? visitDistributionList
      : Array(24).fill({});
  let xAxisData = visitDistributionList.map((_, _idx) => _idx);
  let seriesData = visitDistributionList.map((_) => _.visitNumber || 0) || [];

  data.topData = getTopData(seriesData);
  data.sysVisitsOps = sys_visits_distribute({
    xAxisData,
    seriesData,
    topData: data.topData,
  });
};
// 获取按菜单、组织、角色的访问量图表数据
const getChartData = () => {
  data.echartBarKey = Math.random();
  let { tagType, pageAnalysisMenu, pageAnalysisOrg, pageAnalysisRole } = data;
  if (tagType === "1") {
    let peiaBarData = factoryMenuBarData({
      oriPieBarList: pageAnalysisMenu.menuVisitNumberList || [],
      otherName: "其他菜单",
    });
    data.echartOps = type_visits_distribute({
      xAxisData: peiaBarData.map((_) => _.name),
      seriesData: peiaBarData.map((_) => {
        return {
          id: _.id,
          name: _.name,
          value: _.value - 0,
        };
      }),
      tagType,
    });
  } else if (tagType === "2") {
    // alert(2);
    let peiaBarData = factoryMenuBarData({
      oriPieBarList: pageAnalysisOrg.orgVisitNumberList || [],
      otherName: "其他组织",
    });
    data.echartOps = type_visits_distribute({
      xAxisData: peiaBarData.map((_) => _.name),
      seriesData: peiaBarData.map((_) => {
        return {
          id: _.id,
          name: _.name,
          value: _.value - 0,
        };
      }),
      tagType,
    });
  } else if (tagType === "3") {
    let peiaBarData = factoryMenuBarData({
      oriPieBarList: pageAnalysisRole.roleVisitNumberList || [],
      otherName: "其他角色",
    });
    data.echartOps = type_visits_distribute({
      xAxisData: peiaBarData.map((_) => _.name),
      seriesData: peiaBarData.map((_) => {
        return {
          id: _.id,
          name: _.name,
          value: _.value - 0,
        };
      }),
      tagType,
    });
  }
};
const getTableData = () => {
  let { tagType, pageAnalysisMenu, pageAnalysisOrg, pageAnalysisRole } = data;
  if (tagType === "1") {
    data.commonData = pageAnalysisMenu.commonMenuList || [];
    data.orgData = pageAnalysisMenu.commonOrgList || [];
    data.roleData = pageAnalysisMenu.commonRoleList || [];
  } else if (tagType === "2") {
    data.commonData = pageAnalysisOrg.commonMenuList || [];
    data.orgData = pageAnalysisOrg.commonOrgList || [];
    data.roleData = pageAnalysisOrg.commonRoleList || [];
  } else if (tagType === "3") {
    data.commonData = pageAnalysisRole.commonMenuList || [];
    data.orgData = pageAnalysisRole.commonOrgList || [];
    data.roleData = pageAnalysisRole.commonRoleList || [];
  }
};

const factoryMenuBarData = ({
  oriPieBarList = [],
  valField = "value",
  extralField = "",
  otherName = "其他",
} = {}) => {
  let { barLineLen } = data;
  let pieBarList = []; // 饼图、柱状图数据--不含全部，包含其他(若超过8个)--总长度不超过8个
  let extraList = [];
  let otherItem = null;

  oriPieBarList = deepClone(oriPieBarList);
  // 降序
  oriPieBarList.sort((a, b) => b[valField] - a[valField]); // 降序
  console.log("oriPieBarList", oriPieBarList);

  // 超过8个
  if (oriPieBarList.length > barLineLen) {
    extraList = oriPieBarList.slice(barLineLen - 1) || [];
    console.log(otherName, extraList);
    let otherSum = extraList.reduce((acc, cur) => {
      return acc + ((cur[valField] || 0) - 0);
    }, 0);
    console.log("otherSum", otherSum);
    otherItem = {
      name: otherName,
      [valField]: parseFloat(otherSum.toFixed(2)),
    };
    // 平均响应时间计算
    if (valField === "avgResponseTime") {
      let validLen = extraList.filter((_) => _["avgResponseTime"]).length;
      let timeVal = otherSum / validLen;
      otherItem["avgResponseTime"] = validLen > 0 ? parseFloat(timeVal) : 0;
    }
    // 最大响应时间计算
    if (extralField) {
      // let timeSum = extraList.reduce((acc, cur) => {
      //   return acc + ((cur[extralField] || 0) - 0);
      // }, 0);
      // let validLen = extraList.filter((_) => _[extralField]).length;
      // let timeVal = timeSum / validLen;
      // otherItem[extralField] =
      //   validLen > 0 ? parseFloat(timeVal.toFixed(2)) : 0;

      let maxValue = Math.max(
        ...extraList.map((item) => (item[extralField] || 0) - 0)
      ) || 0;
      otherItem[extralField] = parseFloat(maxValue.toFixed(2)) || 0;
    }
    pieBarList = [...oriPieBarList.slice(0, barLineLen - 1)];
    otherItem && pieBarList.push(otherItem);
  } else {
    // 8个(含)以下
    pieBarList = [...oriPieBarList.slice(0, barLineLen)];
  }
  console.log("图表", pieBarList);
  return pieBarList;
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
    businessType: "operationSystemDetails",
    dateStr: props.staticTime,
    sysCode: props.sysCode,
    ...params,
  })
    .then((res) => {
      if (res.code === 200) {
        closeToast();
        return res.data || {};
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

// 各时段浏览量
const getTimeSpanVisits = () => {
  let { timeSpanVisits } = data;
  data.sysVisitsFieldList[0].val = numThousand(timeSpanVisits.visitNumber);
  data.sysVisitsFieldList[0].floatVal = timeSpanVisits.visitsNumberFront;
  data.sysVisitsFieldList[1].val =
    !timeSpanVisits.peakHourList || timeSpanVisits.peakHourList.length === 0
      ? "--"
      : timeSpanVisits.peakHourList.map((_) => (_ = _ + "点")).join("、");
  getSysChartData();
};
// 首屏加载时间 卡片、图表赋值
const getFScreenLoadTime = () => {
  let { fScreenLoadTime } = data;
  data.fScreenLoadField[0].val = fScreenLoadTime.aveTimeUba;
  data.fScreenLoadField[0].floatVal = fScreenLoadTime.aveTimeUbaCompare;
  data.fScreenLoadField[1].val = fScreenLoadTime.maxTimeUba;
  data.fScreenLoadField[1].floatVal = fScreenLoadTime.maxTimeUbaCompare;

  data.fScreenLoadPieOps = fscreen_load_pie({
    seriesData:
      fScreenLoadTime?.pieChartList?.map((_) => {
        let value = _.value ? _.value - 0 : 0;
        return {
          name: _.name,
          value: parseFloat((value / 1000).toFixed(2)),
        };
      }) || [],
  });
};

// 页面响应时间 卡片、图表赋值
const getSysResTime = () => {
  let { sysPageResTime } = data;
  console.log("sysPageResTime", sysPageResTime);
  data.sysPageFieldList[0].val = sysPageResTime.aveTimeUba;
  data.sysPageFieldList[0].floatVal = sysPageResTime.aveTimeUbaCompare;
  data.sysPageFieldList[1].val = sysPageResTime.maxTimeUba;
  data.sysPageFieldList[1].floatVal = sysPageResTime.maxTimeUbaCompare;

  let peiaBarData = factoryMenuBarData({
    oriPieBarList: sysPageResTime.barChartList || [],
    valField: "avgResponseTime",
    extralField: "maxResponseTime",
    otherName: "其他菜单",
  });
  console.log("peiaBarData", peiaBarData);
  data.sysPageResOps = sys_menu_res_time({
    xAxisData: peiaBarData.map((_) => _.name),
    seriesData: peiaBarData.map((_) => {
      let value = _.avgResponseTime ? _.avgResponseTime - 0 : 0;
      let maxTime = _.maxResponseTime ? _.maxResponseTime - 0 : 0;
      return {
        id: _.id,
        name: _.name,
        value: parseFloat((value / 1000).toFixed(2)),
        maxTime: parseFloat((maxTime / 1000).toFixed(2)),
      };
    }),
  });
};

watch(
  () => props.sysData,
  async (sysData) => {
    if (Object.keys(sysData).length <= 0) return;
    const oriSysData = deepClone(sysData) || {};
    data.oriSysData = oriSysData?.systemAnalysis || {};
    data.hasReportMenu = oriSysData.hasReportMenu === 1;
    data.hasReportOrg = oriSysData.hasReportOrg === 1;
    data.hasReportRole = oriSysData.hasReportRole === 1;
    data.hasReportTimeSpan = oriSysData.hasReportTimeSpan === 1;
    data.hasFirstScreenTime = oriSysData.hasFirstScreenTime === 1;
    data.hasPageResponseTime = oriSysData.hasPageResponseTime === 1;
    // 页面响应时间,首屏加载事件 对象赋值
    data.fScreenLoadTime = data.oriSysData.firstScreenTime || {};
    data.sysPageResTime = data.oriSysData.pageResponseTime || {};

    initData();
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => [props.menuTree, props.orgTree, props.roleTree],
  () => {
    getCheckData();
  },
  {
    deep: true,
    immediate: true,
  }
);

const handleTag = (tag) => {
  console.log("tag", tag);
  initData(false, true);

  // 滚动到顶部
  dropDownCascadeRef.value.scrollToTop();
};
const checkChange = async (obj) => {
  console.log("checkChange", obj);
  data.checkObj = obj;
  let { tagType, checkId, checkOps, oriSysData } = data;
  if (tagType === "1") {
    if (data.checkName === "全部") {
      data.pageAnalysisMenu = oriSysData.pageAnalysisMenu || {};
    } else {
      let name = findNodePath(checkOps, checkId);
      let detailData = await getDetailData({
        queryCode: "system_details_system_analysis_menu",
        searchKey: name,
      });
      console.log("detailData", detailData);
      data.pageAnalysisMenu =
        detailData?.systemAnalysis?.pageAnalysisMenu || {};
    }
  } else if (tagType === "2") {
    if (data.checkName === "全部") {
      data.pageAnalysisOrg = oriSysData.pageAnalysisOrg || {};
    } else {
      let name = findNodePath(checkOps, checkId);
      let detailData = await getDetailData({
        queryCode: "system_details_system_analysis_org",
        searchKey: name,
      });
      console.log("detailData", detailData);
      data.pageAnalysisOrg = detailData?.systemAnalysis?.pageAnalysisOrg || {};
    }
  } else if (tagType === "3") {
    if (data.checkName === "全部") {
      data.pageAnalysisRole = oriSysData.pageAnalysisRole || {};
    } else {
      let name = findNodePath(checkOps, checkId);
      let detailData = await getDetailData({
        queryCode: "system_details_system_analysis_role",
        searchKey: name === "全部" ? "全部" : "全部【/】" + name,
      });
      console.log("detailData", detailData);
      data.pageAnalysisRole =
        detailData?.systemAnalysis?.pageAnalysisRole || {};
    }
  }
  getCardData();
  getChartData();
  getTableData();
};
// 页面响应时间变化
const checkSysResChange = async (obj) => {
  console.log("checkSysResChange", obj);
  let { oriSysData, sysPageCheckId } = data;
  data.sysPageResCheckObj = obj;
  if (data.sysPageCheckName === "全部") {
    data.sysPageResTime = oriSysData.pageResponseTime || {};
  } else {
    let name = findNodePath(props.menuTree, sysPageCheckId);
    let detailData = await getDetailData({
      queryCode: "system_details_system_response_time",
      searchKey: name,
    });
    console.log("detailData", detailData);
    data.sysPageResTime = detailData?.systemAnalysis?.pageResponseTime || {};
  }
  getSysResTime();
};

const clickLabelEvent = ({ name, obj }, type) => {
  if (type === 1) {
    let checkObj;
    if (data.tagType === "1") {
      checkObj = findNodeById(data.checkOps, obj.id, "id");
    } else if (data.tagType === "2") {
      checkObj = findNodeById(data.checkOps, obj.name, "name");
    }
    console.log("下钻数据", checkObj);
    if (!checkObj || !checkObj.children || checkObj.children.length === 0) {
      return;
    }
    if (data.tagType === "1" && checkObj.level >= 4) {
      return;
    }
    if (data.tagType === "2" && checkObj.level >= 4) {
      return;
    }
    data.checkId = checkObj.id;
    data.checkName = checkObj.name;
    checkChange(checkObj);
  } else if (type === 2) {
    let checkObj = findNodeById(props.menuTree, obj.id, "id");
    console.log("下钻数据", checkObj);
    if (!checkObj || !checkObj.children || checkObj.children.length === 0) {
      return;
    }
    data.sysPageCheckId = checkObj.id;
    data.sysPageCheckName = checkObj.name;
    checkSysResChange(checkObj);
  }
};

const scrollToPlace = (id) => {
  emits("scrollToPlace", {
    pageTitle: "系统分析",
    pageType: id,
    id,
    offsetTop: 0,
  });
};
</script>

<style lang="less" scoped>
.card-analysis {
  .card-wrap {
    /deep/ .com-header {
      margin-bottom: 0;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      margin-bottom: 4px;
      padding-left: 11px;
      position: relative;
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
      .title-name {
        display: flex;
        align-items: center;
        position: relative;
        height: 25px;
        font-size: 14px;
        color: #1d252f;
        font-weight: 700;
      }
      /deep/.van-popover__wrapper {
        display: flex;
        margin: 0 2px;
        .tip-img {
          width: 12px;
          height: 12px;
          cursor: pointer;
        }
      }
    }
    .circle-box {
      height: 36px;
      &::before {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }
    .sys-res-box {
      margin: 15px 0 0 0;
      height: auto;
    }

    /deep/ .card-table {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
