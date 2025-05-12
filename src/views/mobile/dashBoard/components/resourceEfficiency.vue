<template>
  <div class="resource-efficiency">
    <card-wrap title="资源效率" :staticTime="staticTime" :imgSrc="imgSrc">
      <template #default>
        <card-main cardTitle="总部管理服务器总数" class="mb-17">
          <div class="server-box">
            <span>总部管理服务器总数：</span>
            <span class="server-val">
              {{
                trafficData.totalServerNumber == 0
                  ? 0
                  : trafficData.totalServerNumber || "--"
              }}</span
            >
            <span>台</span>
          </div>
          <card-table
            :tableColumn="trafficData.tableColumn"
            :tableData="trafficData.tableData"
            :isShowMore="false"
            border
            @sysClick="sysClick"
          ></card-table>
        </card-main>

        <card-main cardTitle="总部服务器使用率分布" showTip>
          <template #tip>
            <div class="popover-content">
              <div><span class="font-bold">采集时段：</span>08:00-22:00；</div>
              <div>
                <span class="font-bold">低： </span>
                CPU平均使用率小于10%且内存使用率小于30%；
              </div>
              <div>
                <span class="font-bold">高：</span>
                CPU平均使用率大于50%，或内存平均使用率大于80%；
              </div>
              <div>
                <span class="font-bold">中：</span>
                CPU和内存平均使用率范围不在低和高范围内的服务器；
              </div>
              <div><span class="font-bold">接入中：</span>接入中的服务器。</div>
            </div>
          </template>
          <echart-bar
            echartDom="serverUseRateDom"
            isTriggerEvent
            :opsObj="serverData.opsObj"
            @clickLabelEvent="clickLabelEvent"
          ></echart-bar>
          <card-table
            :tableColumn="serverData.tableColumn"
            :tableData="typeTableData(3)"
            highlight-current-row
            border
            tableType="server"
            viewAllType="6"
            @current-change="handleCurrentChange"
            @sysClick="sysClick"
            @lookMore="lookMore"
          >
            <template #slot-cpuAvgRate="{ row }">
              <span>CPU</span><br />
              <span>使用率</span>
            </template>
            <template #slot-memoryAvgRate="{ row }">
              <span>内存</span><br />
              <span>使用率</span>
            </template>
          </card-table>
        </card-main>
      </template>
    </card-wrap>

    <sys-action-sheet
      v-if="actionObj.showAction"
      v-model:show-action="actionObj.showAction"
      :tableData="actionObj.tableData"
      :tableColumn="actionObj.tableColumn"
      :actionTitle="actionObj.actionTitle"
      :tableLoading="actionObj.tableLoading"
      :dataFinished="actionObj.dataFinished"
      :placeholder="actionObj.placeholder"
    ></sys-action-sheet>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, getCurrentInstance } from "vue";
import cardWrap from "./cardWrap.vue";
import cardMain from "./cardMain.vue";
import cardTable from "./cardTable.vue";
import echartBar from "@/components/EchartBar";
import sysActionSheet from "./sysActionSheet.vue";

import { server_use_rate } from "../config";
import { rem2px, numThousand, formatDate } from "@/common/utils/comm";

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
const imgSrc = ref(require("@/assets/images/dashBoard/efficiency.svg"));
const trafficData = reactive({
  totalServerNumber: null,
  tableColumn: [
    {
      label: "服务器类型",
      prop: "type",
    },
    {
      label: "数量(台)",
      prop: "number",
      width: 90,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
    },
  ],
  tableData: [],
});

const serverData = reactive({
  opsObj: server_use_rate(),
  tableColumn: [
    {
      label: "典型服务器IP",
      prop: "serverIp",
    },
    {
      label: "关联系统",
      prop: "sysName",
      isShowTag: true,
    },
    {
      label: "CPU使用率",
      prop: "cpuAvgRate",
      width: 65,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      unit: "%",
      headerSlotName: "slot-cpuAvgRate",
    },
    {
      label: "内存使用率",
      prop: "memoryAvgRate",
      width: 65,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      unit: "%",
      headerSlotName: "slot-memoryAvgRate",
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
  type: "低",
});

const actionObj = reactive({
  showAction: false,
  viewAllType: null, // 1-活跃用户 2-访问量情况 3-访问分布 4-系统响应时间 5-宕机情况 6-总部服务器使用率分布
  tableLoading: true,
  dataFinished: true,
  placeholder: "请输入系统名称或IP",
  actionTitle: "",
  tableData: [],
  tableColumn: [],
});

const typeTableData = (topNum) => {
  let list = serverData.tableData.filter((_) => _.type === serverData.type);
  if (serverData.type === "中" || serverData.type === "高") {
    list = list.sort((a, b) => {
      return b.memoryAvgRate - a.memoryAvgRate;
    });
    list = list.sort((a, b) => {
      return b.cpuAvgRate - a.cpuAvgRate;
    });
  } else {
    list = list.sort((a, b) => {
      return a.memoryAvgRate - b.memoryAvgRate;
    });
    list = list.sort((a, b) => {
      return a.cpuAvgRate - b.cpuAvgRate;
    });
  }

  if (topNum) {
    return list.slice(0, topNum);
  }
  return list;
};

watch(
  () => props.echartData,
  (echartData) => {
    if (Object.keys(echartData).length > 0) {
      let obj = JSON.parse(JSON.stringify(echartData)) || {};
      // 管理服务器总数
      let serverManager = obj.serverManager || {};
      let serverTypeList = serverManager.serverTypeList || [];
      trafficData.tableData = serverTypeList;
      trafficData.totalServerNumber = numThousand(
        serverManager.totalServerNumber
      );

      // 服务器使用率分布
      let { lowNumber, inNumber, highNumber, unknownNumber, systemList } =
        obj.serverUsage || {};
      let xAxisData = ["低", "中", "高", "接入中"];
      let seriesData = [
        lowNumber || 0,
        inNumber || 0,
        highNumber || 0,
        unknownNumber || 0,
      ];
      console.log("服务器使用率分布", seriesData);
      serverData.tableData = systemList || [];
      serverData.opsObj = server_use_rate({
        xAxisData,
        seriesData,
        type: serverData.type,
      });
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

const clickLabelEvent = (params) => {
  console.log("clickLabelEvent", params);
  serverData.type = params.name;
};

const handleCurrentChange = (row) => {
  console.log("handleCurrentChange-->", row);
};
const sysClick = (row) => {
  console.log("sysClick-->", row);
};

const lookMore = ({ tableType, viewAllType }) => {
  console.log("lookMore", tableType);
  let timer = null;
  let tableColumn = [];
  if (timer) timer.clerarTimeout(timer);
  actionObj.tableData = [];
  actionObj.tableLoading = true;
  actionObj.dataFinished = false;
  actionObj.showAction = true;
  actionObj.viewAllType = viewAllType;
  switch (tableType) {
    case "server":
      actionObj.actionTitle = `${formatDate(props.staticTime)}服务器使用率分布`;
      tableColumn = JSON.parse(JSON.stringify(serverData.tableColumn));
      timer = setTimeout(() => {
        actionObj.tableData = typeTableData();
        actionObj.tableLoading = false;
        actionObj.dataFinished = true;
      }, 400);
      break;
  }
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
      headCellBgColor: "#F5F5F5",
      label: _.label === "典型系统" ? "系统名称" : _.label,
    };
  });
  actionObj.tableColumn = tableColumn;
};
</script>

<style lang="less" scoped>
.resource-efficiency {
  width: 100%;
  padding: 10px 15px 10px 15px;
  background: #ffffff;
  .server-box {
    margin-bottom: 8px;
    .server-val {
      font-size: 18px;
      color: #526ae7;
      font-weight: 700;
    }
  }
}
</style>
