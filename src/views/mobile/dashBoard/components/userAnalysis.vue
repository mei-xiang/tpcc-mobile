<template>
  <div class="user-analysis">
    <div ref="borderLTopRef" class="border-left-top"></div>
    <div ref="borderRTopRef" class="border-right-top"></div>
    <!-- 用户分析 -->
    <card-wrap class="user-wrap" title="用户分析" :staticTime="staticTime">
      <template #default>
        <card-main cardTitle="活跃用户" showTip>
          <card-data :fieldList="userData.fieldList"></card-data>
          <echart-bar
            echartDom="userDistributeDom"
            height="200"
            :opsObj="userData.opsObj"
            isHideTipEvent
            echartTitle="日活跃用户趋势图"
          ></echart-bar>
          <card-table
            :tableColumn="userData.tableColumn"
            :tableData="userData.tableData.slice(0, 3)"
            highlight-current-row
            tableType="activeUser"
            viewAllType="1"
            border
            @current-change="handleCurrentChange"
            @sysClick="sysClick"
            @lookMore="lookMore"
          >
            <!-- 系统名称 -->
            <template #slot-sys-name="{ row, idx }">
              <span :class="[row.dataSource === 2 ? 'sys-name' : '']">
                {{ row.sysName }}
              </span>
            </template>
          </card-table>
          <template #tip>
            <div class="popover-content">
              <div>
                <span class="font-bold">日活跃用户： </span>
                <span>指当日访问过系统的用户数量。</span>
                <div>
                  （1）接了埋点的系统，从埋点平台取当日访问过系统的用户，根据用户的id去重。每个用户在埋点平台拥有唯一的用户id，跟设备无关。
                </div>
                <div>
                  （2）没接埋点的系统，从监控系统取当日访问过系统的用户，视为活跃用户，根据用户的ip地址去重。
                </div>
              </div>
              <div>
                <span class="font-bold">月活跃用户： </span>
                <span>指当月访问过系统的用户数量。</span>
              </div>
              <div>
                <span class="font-bold">总日活跃用户：</span>
                <span>统计当日访问过所有系统的去重ip数。</span>
              </div>
              <div>
                <span class="font-bold">总月活跃用户：</span>
                <span>统计当月访问过所有系统的去重ip数。</span>
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
      :type="actionObj.type"
      @handleCurrentChange="handleCurrentChange"
    ></sys-action-sheet>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import cardWrap from "./cardWrap.vue";
import cardMain from "./cardMain.vue";
import cardData from "./cardData.vue";
import cardTable from "./cardTable.vue";
import sysActionSheet from "./sysActionSheet.vue";
import { rem2px, numThousand, formatDate } from "@/common/utils/comm";
import { user_distribution } from "../config";

const { proxy } = getCurrentInstance();
const router = useRouter();
const store = useStore();
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
const borderLTopRef = ref(null);
const borderRTopRef = ref(null);
// 活跃用户
const userData = reactive({
  fieldList: [
    {
      name: "总日活跃用户",
      val: null,
      floatVal: null,
      isShowTag: true,
    },
    {
      name: "总月活跃用户",
      val: null,
      floatVal: null,
      isShowTag: true,
    },
  ],
  opsObj: user_distribution(),
  tableColumn: [
    {
      label: "典型系统",
      prop: "sysName",
      slotName: "slot-sys-name",
    },
    {
      label: "日活跃用户",
      prop: "dailyActiveUserCount",
      width: 95,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
      isShowTag: true,
    },
    {
      label: "月活跃用户",
      prop: "monthlyActiveUserCount",
      width: 110,
      align: "right",
      headerAlign: "right",
      headCellBgColor: "#FDF3E7",
      bodyCellColor: "#526AE7",
      isThousand: true,
      isShowTag: true,
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

const actionObj = reactive({
  showAction: false,
  actionTitle: "",
  tableData: [],
  tableColumn: [],
  type: "",
});

onMounted(() => {
  if (proxy.$isIphone) {
    borderLTopRef && (borderLTopRef.value.style.display = "none");
    borderRTopRef && (borderRTopRef.value.style.display = "none");
  }
});

watch(
  () => props.echartData,
  (echartData) => {
    if (Object.keys(echartData).length > 0) {
      console.log("进来了吗");
      let obj = JSON.parse(JSON.stringify(echartData)) || {};
      // 活跃用户
      let activeUser = obj.activeUser || {};
      console.log("activeUser", activeUser);
      userData.tableData = activeUser.activeUserSystemList || [];
      userData.fieldList[0].val = numThousand(activeUser.dailyActiveUserCount);
      userData.fieldList[0].floatVal = activeUser.dailyActiveUserCountRate;
      userData.fieldList[1].val = numThousand(
        activeUser.monthlyActiveUserCount
      );
      userData.fieldList[1].floatVal = activeUser.monthlyActiveUserRate;

      let activeUserBarList = activeUser.activeUserBarList
        ? activeUser.activeUserBarList || []
        : Array(15).fill({});
      let xAxisData = activeUserBarList.map((_, _idx) => {
        return _.belongDate || 0;
      });
      let seriesData =
        activeUserBarList.map((_) => _.dailyActiveUserCount || 0) || [];
      console.log("xAxisData1", xAxisData);
      console.log("seriesData1", seriesData);
      userData.opsObj = user_distribution({
        xAxisData,
        seriesData,
        data: activeUserBarList,
      });
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

const handleCurrentChange = (row) => {
  console.log("handleCurrentChange-->", row);
  if (row.dataSource === 2) {
    router.push({
      name: "sysDetails",
      query: {
        sysCode: row.sysCode,
        sysName: row.sysName,
        dateTime: store.state.dashBoard.staticTime,
      },
    });
  }
};
const sysClick = (row) => {
  console.log("sysClick-->", row);
};
const lookMore = () => {
  console.log("lookMore");
  let tableColumn = JSON.parse(JSON.stringify(userData.tableColumn));
  actionObj.showAction = true;
  actionObj.actionTitle = `${formatDate(props.staticTime)}活跃用户`;
  actionObj.tableData = userData.tableData;
  tableColumn.push({
    isPlace: true,
    label: "",
    width: 5,
    align: "center",
    headCellBgColor: "#F5F5F5",
  });
  actionObj.type = "activeUser";
  actionObj.tableColumn = tableColumn.map((_) => {
    return {
      ..._,
      slotName: _.prop === "sysName" ? "slot-sys-name" : "",
      isLink: _.prop === "sysName" ? true : false,
      headCellBgColor: "#F5F5F5",
      label: _.label === "典型系统" ? "系统名称" : _.label,
    };
  });
};
</script>

<style lang="less" scoped>
.user-analysis {
  // margin-bottom: 10px;
  background: #ffffff;
  position: relative;
  border-radius: 10px 10px 0px 0px;
  .border-left-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 15px;
    height: 15px;
    background-color: #dee4fb;
    z-index: 1;
  }
  .border-right-top {
    position: absolute;
    top: 0;
    right: 0;
    width: 15px;
    height: 15px;
    background-color: #e4e9fc;
    z-index: 1;
  }
  .user-wrap {
    padding: 10px 15px 10px 15px;
    border-radius: 12px 12px 0 0;
    position: relative;
    z-index: 2;
    background: #fff;
    .card-head {
      margin-bottom: 10px;
    }
    .sys-name {
      text-decoration: underline;
      color: #526ae7;
      cursor: pointer;
    }
  }
}
@media screen and (min-width: 700px) {
  .user-analysis {
    .border-left-top {
      background-color: #eaeefd;
    }
    .border-right-top {
      background-color: #f0f3fe;
    }
  }
}
</style>
