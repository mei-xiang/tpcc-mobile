<template>
  <div class="sys-analysis">
    <card-wrap title="系统分析" :staticTime="staticTime" :imgSrc="imgSrc">
      <template #default>
        <card-main
          cardTitle="系统请求量情况"
          showTip
          :class="['mb-17', 'visit-main']"
        >
          <card-data :fieldList="trafficData.fieldList"></card-data>
          <echart-bar
            echartDom="visitDistributeDom"
            height="170"
            :opsObj="visitDisData.opsObj"
            isHideTipEvent
            isTriggerEvent
            echartTitle="当日系统请求量分布图"
            @clickLabelEvent="clickLabelEvent"
          ></echart-bar>

          <!-- 访问分布时段 -->
          <template v-if="visitStatus === 2">
            <div class="visit-time-text">
              <span>{{ getVisitTimeTxt }}</span>
              <img :src="closeImg" alt="" @click="toggleVisitTime" />
            </div>
            <card-table
              :tableColumn="visitDisData.tableColumn"
              :tableData="getVisitDisTable(3)"
              highlight-current-row
              border
              tableType="visitDistribute"
              viewAllType="3"
              @current-change="handleCurrentChange"
              @sysClick="sysClick"
              @lookMore="lookMore"
            ></card-table>
          </template>

          <!-- 当日访问量 -->
          <template v-if="visitStatus === 1">
            <card-table
              :tableColumn="trafficData.tableColumn"
              :tableData="trafficData.tableData.slice(0, 3)"
              highlight-current-row
              border
              tableType="traffic"
              viewAllType="2"
              @current-change="handleCurrentChange"
              @sysClick="sysClick"
              @lookMore="lookMore"
            >
              <template #slot-peakHourList="{ row }">
                <div class="peak-period-box">
                  <span
                    v-for="(item, index) in row.peakHourList"
                    :key="index"
                    class="peak-period-txt"
                  >
                    {{ item + "点" }}
                  </span>
                </div>
              </template>
            </card-table>
          </template>
          <template #tip>
            <div class="popover-content">
              <div>
                <span class="font-bold">系统请求量： </span>
                <span>
                  统计当日系统域名的访问次数，通过域名访问一次系统，请求量会+1。
                </span>
              </div>
              <div>
                <span class="font-bold">高峰期：</span>
                <span>按小时统计当日系统的请求量，取最高的两个时间段。</span>
              </div>
              <div>
                <span class="font-bold">总请求量： </span>
                <span>当日所有系统的请求量的累加值。</span>
              </div>
              <div>
                <span class="font-bold">总高峰期： </span>
                <span>
                  按小时统计当日所有系统的请求量，取最高的两个时间段。
                </span>
              </div>
            </div>
          </template>
        </card-main>

        <card-main cardTitle="系统响应时间" showTip class="mb-17">
          <card-data :fieldList="sysResData.fieldList"></card-data>
          <card-table
            :tableColumn="sysResData.tableColumn"
            :tableData="sysResData.tableData.slice(0, 3)"
            highlight-current-row
            border
            tableType="sysRes"
            viewAllType="4"
            @current-change="handleCurrentChange"
            @sysClick="sysClick"
            @lookMore="lookMore"
          ></card-table>
          <template #tip>
            <div class="popover-content">
              <div>
                <span class="font-bold">平均响应： </span>
                <span>是指所有请求响应时间的平均值；</span>
              </div>
              <div>
                <span class="font-bold">慢请求数：</span>
                <span>
                  是指响应时间超过3秒的请求数。
                </span>
              </div>
            </div>
          </template>
        </card-main>

        <card-main cardTitle="宕机情况" showTip>
          <card-data :fieldList="downTimeData.fieldList"></card-data>
          <card-table
            :tableColumn="downTimeData.tableColumn"
            :tableData="downTimeData.tableData.slice(0, 3)"
            highlight-current-row
            border
            tableType="downTime"
            viewAllType="5"
            @current-change="handleCurrentChange"
            @sysClick="sysClick"
            @lookMore="lookMore"
          >
            <template #slot-down-count="{ row }">
              <div class="down-time-box">
                <span>{{ row.totalDowntimeCount }}</span>
                <div
                  class="down-time-tag"
                  :style="{ minWidth: row.top3CountMaxWidth }"
                >
                  <span class="down-time-txt">月</span>
                  <span class="down-time-val">
                    {{ row.monthTotalDowntimeCount || 0 }}
                  </span>
                </div>
              </div>
            </template>
            <template #slot-down-time="{ row }">
              <div class="down-time-box">
                <span>{{ row.totalDowntime }}</span>
                <div
                  class="down-time-tag"
                  :style="{ minWidth: row.top3TimetMaxWidth }"
                >
                  <span class="down-time-txt">月</span>
                  <span class="down-time-val">
                    {{ row.monthTotalDowntime || 0 }}
                  </span>
                </div>
              </div>
            </template>
          </card-table>
          <template #tip>
            <div class="popover-content">
              <div>
                <span class="font-bold">当日宕机： </span>
                <span>
                  当日系统非发版时间意外中断服务的次数累加。一个系统有多个服务的，如果各服务中断时段重叠的，次数只计算1次。
                </span>
              </div>
              <div>
                <span class="font-bold">当日宕机总时长：</span>
                <span>
                  当日系统每次非发版时间从意外中断服务至恢复服务的时长累加。一个系统有多个服务的，如果各服务中断时段重叠的，对时长进行去重。
                </span>
              </div>
              <div>
                <span class="font-bold">总宕机次数： </span>
                <span>当日所有系统宕机次数累加。</span>
              </div>
              <div>
                <span class="font-bold">总平均恢复时长： </span>
                <span> 当日所有系统宕机总时长 / 当日宕机总次数。 </span>
              </div>
            </div>
          </template>
        </card-main>
      </template>
    </card-wrap>

    <sys-action-sheet
      v-if="actionObj.showAction"
      v-model:show-action="actionObj.showAction"
      :tableData="actionObj.tableData"
      :tableColumn="actionObj.tableColumn"
      :actionTitle="actionObj.actionTitle"
      :isExpand="actionObj.isExpand"
      :footerLine="actionObj.footerLine"
      :downMonthData="actionObj.downMonthData"
    >
      <template
        v-if="actionObj.slotName === 'downTime'"
        #expand="{ expandRow }"
      >
        <card-table
          class="expand-table"
          :tableColumn="downTimeData.downTableColumn"
          :tableData="expandRow.downtimeDetailsList"
          :isShowMore="false"
        >
          <template #slot-idx="{ row, idx }">
            <span class="down-time-idx">{{ idx + 1 }}</span>
          </template>
          <template #slot-time-span="{ row, idx }">
            <span :class="[row.isRange === 1 ? 'red-color' : 'range-color']">
              {{ row.timeSpan }}
            </span>
          </template>
          <template #slot-duration="{ row, idx }">
            <span :class="[row.isRange === 1 ? 'red-color' : 'range-color']">
              {{ row.downtimeDuration }}
            </span>
          </template>
        </card-table>
      </template>
    </sys-action-sheet>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  // onMounted,
  computed,
  watch,
  getCurrentInstance,
} from "vue";
import cardWrap from "./cardWrap.vue";
import cardMain from "./cardMain.vue";
import cardData from "./cardData.vue";
import cardTable from "./cardTable.vue";
import echartBar from "@/components/EchartBar";
import sysActionSheet from "./sysActionSheet.vue";

import { visit_distribute } from "../config";
import { rem2px, numParse, numThousand, formatDate } from "@/common/utils/comm";

const { proxy } = getCurrentInstance();
const props = defineProps({
  staticTime: {
    type: String,
    default: "",
  },
  echartData: {
    type: Object,
    default: () => {},
  },
});

const imgSrc = ref(require("@/assets/images/dashBoard/analysis.svg"));
const closeImg = ref(require("@/assets/images/dashBoard/close.svg"));
const visitStatus = ref(1); // 1当日 2时段
// 访问量情况
const trafficData = reactive({
  fieldList: [
    {
      name: "总请求量",
      val: null,
      floatVal: null,
      unit: "次",
      numUnit: "万",
    },
    {
      name: "高峰期",
      val: null,
      floatVal: null,
      unit: "",
      isHideFloat: true,
    },
  ],
  tableColumn: [
    {
      label: "典型系统",
      prop: "sysName",
    },
    {
      label: "请求量(次)",
      prop: "interfaceVisitsNumber",
      width: 90,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      unit: "万",
      isThousand: true,
    },
    {
      label: "高峰期",
      prop: "peakHourList",
      slotName: "slot-peakHourList",
      width: 96,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
    },
    // {
    //   isPlace: true,
    //   label: "",
    //   width: 20,
    //   align: "center",
    //   headCellBgColor: "#FDF3E7",
    // },
  ],
  tableData: [],
  copyTableData: [],
});

// 访问分布
const visitDisData = reactive({
  tableAllData: [],
  opsObj: visit_distribute(),
  tableColumn: [
    {
      label: "典型系统",
      prop: "sysName",
    },
    {
      label: "请求量(次)",
      prop: "visitNumber",
      width: 90,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
    // {
    //   isPlace: true,
    //   label: "",
    //   width: 20,
    //   align: "center",
    //   headCellBgColor: "#FDF3E7",
    // },
  ],
  tableData: [],
  topData: [],
  dataIdx: -1,
});

// 系统响应时间
const sysResData = reactive({
  fieldList: [
    {
      name: "总平均响应",
      val: null,
      floatVal: null,
      unit: "秒",
      floatUnit: "秒",
    },
    {
      name: "总慢请求数",
      val: null,
      floatVal: null,
      unit: "次",
      isHideFloat: true,
    },
  ],
  tableColumn: [
    {
      label: "典型系统",
      prop: "sysName",
    },
    {
      label: "平均响应(秒)",
      prop: "averageResponseTime",
      width: 100,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
    {
      label: "慢请求数(次)",
      prop: "slowRequestNumber",
      width: 90,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
      // unit: "%",
    },
    // {
    //   isPlace: true,
    //   label: "",
    //   width: 20,
    //   align: "center",
    //   headCellBgColor: "#FDF3E7",
    // },
  ],
  tableData: [],
});

// 宕机情况
const downTimeData = reactive({
  fieldList: [
    {
      name: "总宕机次数",
      val: null,
      floatVal: null,
      unit: "次",
      floatUnit: "次",
    },
    {
      name: "总平均恢复时长",
      val: null,
      floatVal: null,
      unit: "分钟",
      floatUnit: "分钟",
    },
  ],
  tableColumn: [
    {
      label: "典型系统",
      prop: "sysName",
    },
    {
      label: "当日宕机(次)",
      slotName: "slot-down-count",
      prop: "totalDowntimeCount",
      width: 105,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
    {
      label: "总时长(分钟)",
      prop: "totalDowntime",
      slotName: "slot-down-time",
      width: 110,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
    // {
    //   isPlace: false,
    //   label: "",
    //   width: 20,
    //   align: "center",
    //   headCellBgColor: "#FDF3E7",
    // },
  ],
  downTableColumn: [
    {
      label: "序号",
      slotName: "slot-idx",
      align: "left",
      headerAlign: "left",
      bodyCellColor: "#FFFFFF",
    },
    {
      label: "宕机时段",
      prop: "timeSpan",
      slotName: "slot-time-span",
      width: 105,
      align: "right",
      headerAlign: "right",
      bodyCellColor: "#526AE7",
    },
    {
      label: "宕机时长",
      prop: "downtimeDuration",
      slotName: "slot-duration",
      width: 110,
      align: "right",
      headerAlign: "right",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
    {
      label: "",
      isPlace: true,
      width: 5,
    },
  ],
  tableData: [],
  monthTableData: [], // 月宕机情况
});

// 看板
const actionObj = reactive({
  slotName: "",
  showAction: false,
  viewAllType: null, // 1-活跃用户 2-访问量情况 3-访问分布 4-系统响应时间 5-宕机情况 6-总部服务器使用率分布
  actionTitle: "",
  isExpand: false,
  footerLine: true, // 是否显示底部横线及查看更多
  // 宕机详情月活数据
  downMonthData: {
    showTable: false,
    footerLine: true, // 是否显示最后一个table底部横线及查看更多
    tableData: [],
    tableColumn: [],
  },
  tableData: [],
  tableColumn: [],
});

const getTopData = (data = [], num = 2) => {
  if (data.length === 0) return [];
  let topData = JSON.parse(JSON.stringify(data))
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

// 访问分布--高峰时间
// const visitTime = computed(() => {
//   let topData = visitDisData.topData.filter((_) => _.value > 0);
//   if (topData.length === 0) return "--";
//   let idxArr = topData.map((_) => {
//     return _.index + "点";
//   });
//   return idxArr.join("、");
// });
// 访问分布--某个时间段 '14:00-15:00'
const getVisitTimeTxt = computed(() => {
  let idx = visitDisData.dataIdx;
  if (idx < 0) return "";
  return `${idx.toString().padStart(2, "0")}:00-${(idx + 1)
    .toString()
    .padStart(2, "0")}:00`;
});
const getDownTagMaxWidth = (tableData, key, len = 3) => {
  let list = tableData.slice(0, len);
  let maxVal = getMax(list, key);
  let minWidth = proxy.$px2rem(30);
  switch (maxVal.toString().length) {
    case 0:
    case 1:
      minWidth = proxy.$px2rem(20);
      break;
    case 2:
      minWidth = proxy.$px2rem(40);
      break;
    case 3:
      minWidth = proxy.$px2rem(46);
      break;
    case 4:
      minWidth = proxy.$px2rem(55);
      break;
    case 5:
      minWidth = proxy.$px2rem(60);
      break;
    case 6:
      minWidth = proxy.$px2rem(65);
      break;
    default:
      minWidth = proxy.$px2rem(70);
      break;
  }
  return minWidth;
};
const getMax = (arr, key) => {
  if (!arr) return 0;
  let maxVal = arr.reduce((prev, cur, idx) => {
    if (!cur[key]) return prev;
    return cur[key] > prev ? cur[key] : prev;
  }, 0);
  return maxVal;
};
// 访问分布--表格
const getVisitDisTable = (len) => {
  let list =
    visitDisData.tableAllData[visitDisData.dataIdx]
      ?.visitDistributionSystemList || [];
  return len ? list.slice(0, 3) : list;
};
// 数据加工
const factoryData = (obj) => {
  // 访问量情况
  let visits = obj.visits || {};
  let visitsSystemList = visits.visitsSystemList || [];
  trafficData.fieldList[0].val = numThousand(
    numParse(visits.interfaceVisitsNumber)
  );
  trafficData.fieldList[0].floatVal = visits.interfaceVisitsNumberRate;
  trafficData.fieldList[1].val =
    !visits.peakHourList || visits.peakHourList.length === 0
      ? "--"
      : visits.peakHourList.map((_) => (_ = _ + "点")).join("、");
  trafficData.copyTableData = JSON.parse(JSON.stringify(visitsSystemList));
  trafficData.copyTableData.forEach((_) => {
    let peakHourList = _.peakHourList || [];
    _.peakHourList = peakHourList.map((item) =>
      item.toString().padStart(2, "0")
    );
  });
  visitsSystemList.forEach((_) => {
    if (_.interfaceVisitsNumber) {
      _.interfaceVisitsNumber = parseFloat(
        _.interfaceVisitsNumber / 1e4
      ).toFixed(2);
    }
    let peakHourList = _.peakHourList || [];
    _.peakHourList = peakHourList.map((item) =>
      item.toString().padStart(2, "0")
    );
  });
  trafficData.tableData = visitsSystemList;
  console.log("visitsSystemList", visitsSystemList);

  // 访问分布
  let visitDistributionList = obj.visitDistributionList
    ? obj.visitDistributionList || []
    : Array(24).fill({});
  let xAxisData = visitDistributionList.map((_, _idx) => _idx);
  let seriesData = visitDistributionList.map((_) => _.visitNumber || 0) || [];
  let topData = getTopData(seriesData);
  let topObj = topData.find((_) => _.top1);
  visitDisData.tableAllData = visitDistributionList;
  visitDisData.topData = getTopData(seriesData);
  visitDisData.dataIdx = topObj ? topObj.index : -1;
  visitDisData.opsObj = visit_distribute({
    xAxisData,
    seriesData,
    data: visitDistributionList,
    topData: visitDisData.topData,
  });

  // 系统响应时间
  let systemResponseTime = obj.systemResponseTime || {};
  sysResData.tableData = systemResponseTime.systemResponseTimeSystemList || [];
  sysResData.fieldList[0].val = numThousand(
    systemResponseTime.averageResponseTime
  );
  sysResData.fieldList[0].floatVal = systemResponseTime.averageResponseTimeRate;
  sysResData.fieldList[1].val = numThousand(systemResponseTime.slowRequestNumber);

  // 宕机情况
  let downtime = obj.downtime || {};
  downTimeData.tableData = downtime.downtimeSystemList || [];
  downTimeData.monthTableData = downtime.monthDowntimeSystemList || [];
  let downTableLen = downTimeData.tableData.length;
  let downMonTableLen = downTimeData.monthTableData.length;
  let top3CountMaxWidth = getDownTagMaxWidth(
    downTimeData.tableData,
    "monthTotalDowntimeCount"
  );
  let top3TimetMaxWidth = getDownTagMaxWidth(
    downTimeData.tableData,
    "monthTotalDowntime"
  );
  let allCountMaxWidth = getDownTagMaxWidth(
    downTimeData.tableData,
    "monthTotalDowntimeCount",
    downTableLen
  );
  let allTimeMaxWidth = getDownTagMaxWidth(
    downTimeData.monthTableData,
    "monthTotalDowntime",
    downTableLen
  );
  let allMonCountMaxWidth = getDownTagMaxWidth(
    downTimeData.monthTableData,
    "monthTotalDowntimeCount",
    downMonTableLen
  );
  let allMonTimeMaxWidth = getDownTagMaxWidth(
    downTimeData.monthTableData,
    "monthTotalDowntime",
    downMonTableLen
  );

  downTimeData.tableData.forEach((_) => {
    _.downtimeDetailsList = _.downtimeDetailsList || [];
    _.top3CountMaxWidth = top3CountMaxWidth;
    _.top3TimetMaxWidth = top3TimetMaxWidth;
    _.allCountMaxWidth = allCountMaxWidth;
    _.allTimeMaxWidth = allTimeMaxWidth;
  });
  downTimeData.monthTableData.forEach((_) => {
    _.allCountMaxWidth = allMonCountMaxWidth;
    _.allTimeMaxWidth = allMonTimeMaxWidth;
  });
  downTimeData.fieldList[0].val = numThousand(downtime.totalDowntimeCount);
  downTimeData.fieldList[0].floatVal = downtime.totalDowntimeCountRate;
  downTimeData.fieldList[1].val = numThousand(downtime.averageRecoveryTime);
  downTimeData.fieldList[1].floatVal = downtime.averageRecoveryTimeRate;
};

watch(
  () => props.echartData,
  (echartData) => {
    if (Object.keys(echartData).length > 0) {
      let obj = JSON.parse(JSON.stringify(echartData)) || {};
      factoryData(obj);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// echarts中tooltip自定义模板的点击事件，挂载在window中进行接收
window.tplSysClick = (data) => {
  console.log("tplSysClick", data);
};
window.tplSysAllClick = (data) => {
  console.log("tplSysAllClick", data);
  data.forEach((_) => {
    _.visitNumber = numThousand(_.visitNumber);
  });
  lookMore({ tableType: "visitDistribute", viewAllType: 3, data });
};
// const __resizeHandler = () => {
//   // 监听窗口大小变化，重新计算css样式，再渲染图表
//   factoryData(JSON.parse(JSON.stringify(props.echartData)));
// };
// window.addEventListener("resize", __resizeHandler);
// onMounted(() => {
//   window.addEventListener("resize", __resizeHandler);
// });

const clickLabelEvent = (params) => {
  console.log("clickLabelEvent", params);
  visitDisData.dataIdx = params.name - 0;
  visitStatus.value = 2;
};
const toggleVisitTime = () => {
  visitStatus.value = 1;
};
const handleCurrentChange = (row) => {
  console.log("handleCurrentChange-->", row);
};
const sysClick = (row) => {
  console.log("sysClick-->", row);
};
const lookMore = ({ tableType, viewAllType, data = [] }) => {
  console.log("lookMore", tableType, viewAllType);
  actionObj.isExpand = false;
  actionObj.footerLine = true;
  // 宕机详情月活数据
  actionObj.downMonthData.showTable = false;
  let tableColumn = [];
  switch (tableType) {
    case "traffic":
      actionObj.actionTitle = `${formatDate(props.staticTime)}系统请求量情况`;
      actionObj.tableData = trafficData.copyTableData;
      tableColumn = JSON.parse(JSON.stringify(trafficData.tableColumn));
      tableColumn.forEach((_) => {
        if (_.prop === "interfaceVisitsNumber") {
          _.unit = "";
        }
      });
      break;
    case "visitDistribute":
      actionObj.actionTitle = `${formatDate(props.staticTime)}系统请求量情况`;
      actionObj.tableData = getVisitDisTable();
      tableColumn = JSON.parse(JSON.stringify(visitDisData.tableColumn));
      break;
    case "sysRes":
      actionObj.actionTitle = `${formatDate(props.staticTime)}系统响应时间`;
      actionObj.tableData = sysResData.tableData;
      tableColumn = JSON.parse(JSON.stringify(sysResData.tableColumn));
      break;
    case "downTime":
      actionObj.actionTitle = `${formatDate(props.staticTime)}宕机情况`;
      actionObj.tableData = downTimeData.tableData;
      tableColumn = JSON.parse(JSON.stringify(downTimeData.tableColumn));
      tableColumn.forEach((_) => {
        if (_.prop === "sysName") {
          _.slotName = "slot-down-sys";
        }
      });
      actionObj.slotName = "downTime";
      actionObj.isExpand = true;
      // actionObj.footerLine = false;

      actionObj.downMonthData = {
        showTable: true,
        footerLine: true, // 是否显示最后一个table底部横线及查看更多
        tableData: downTimeData.monthTableData,
        tableColumn: tableColumn,
      };

      break;
  }
  actionObj.showAction = true;
  actionObj.viewAllType = viewAllType;
  tableColumn.push({
    isPlace: true,
    label: "",
    width: 5,
    align: "center",
    headCellBgColor: "#F5F5F5",
  });
  tableColumn = tableColumn.map((_) => {
    return {
      ..._,
      slotName: _.slotName
        ? _.slotName
        : _.prop === "sysName"
        ? "slot-sys-name"
        : "",
      headCellBgColor: "#F5F5F5",
      label: _.label === "典型系统" ? "系统名称" : _.label,
    };
  });
  console.log("tableColumn", tableColumn);
  actionObj.tableColumn = tableColumn;
  actionObj.downMonthData.tableColumn = tableColumn;
};
</script>

<style lang="less" scoped>
.sys-analysis {
  padding: 10px 15px 10px 15px;
  background: #ffffff;
  margin-bottom: 10px;
  .visit-main {
    .card-head {
      margin-bottom: 10px;
    }
  }
  .visit-time-text {
    display: flex;
    align-items: center;
    height: 20px;
    margin: 10px 0 5px 0;
    span {
      margin-right: 5px;
    }
    img {
      cursor: pointer;
    }
  }
}

/deep/.downActionTable {
  &.card-table {
    > .el-table {
      .el-table__header-wrapper {
        .cell {
          font-size: 14px;
          font-weight: 700;
        }
      }
    }
  }
}

/deep/ .expand-table {
  pointer-events: none;
  &.el-table {
    .el-table__header-wrapper {
      display: none;
    }
    .cell {
      line-height: 20px;
    }
    tr {
      background-color: #f5f5f5;
    }
    td {
      border: none;
    }
    .el-table__inner-wrapper {
      &::before {
        height: 0px;
      }
      &::after {
        height: 0px;
      }
    }
  }
  .down-time-idx {
    display: inline-block;
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 50%;
    color: #fff;
    background: #a6a6a6;
    text-align: center;
    transform: translateX(40px);
  }
  .red-color {
    color: #f05f5f;
  }
  .blue-color {
    color: #526ae7;
  }
  .range-color {
    color: #1d2129;
    font-weight: 500;
  }
}
</style>
