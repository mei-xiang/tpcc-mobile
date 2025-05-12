<template>
  <van-overlay
    :show="isShow"
    class-name="action-sheet-overlay"
    @click="isShow = false"
  />
  <van-floating-panel
    v-if="isShow"
    v-model:height="actionHeight"
    :anchors="anchors"
    :content-draggable="false"
    :safe-area-inset-bottom="true"
    :lock-scroll="true"
    :duration="0"
    class="floating-panel-wrap"
  >
    <div class="panel-header">
      <div class="header-con">
        <span>{{ actionTitle }}</span>
        <img :src="closeImg" alt="" @click="closeAction" />
        <!-- <span>面板显示高度 {{ actionHeight.toFixed(0) }} px</span> -->
      </div>
    </div>
    <card-table
      class="table-wrap"
      v-loading="tableLoading"
      :tableColumn="tableColumn"
      :tableData="filterTableData"
      :isExpand="isExpand"
      :dataFinished="dataFinished"
      :footerLine="footerLine"
      highlight-current-row
      default-expand-all
      :isShowMore="false"
      @current-change="handleCurrentChange"
      @sysClick="sysClick"
    >
      <template #slot-cpuAvgRate="{ row }">
        <span>CPU</span><br />
        <span>使用率</span>
      </template>
      <template #slot-memoryAvgRate="{ row }">
        <span>内存</span><br />
        <span>使用率</span>
      </template>
      <!-- 系统名称 -->
      <template #slot-sys-name="{ row, idx, column }">
        <span
          :class="[
            (column.isLink && row.dataSource === 2 && type === 'activeUser') ||
            (column.isLink && type !== 'activeUser')
              ? 'sys-name'
              : '',
          ]"
        >
          {{ idx + 1 + "." + row.sysName }}
        </span>
      </template>

      <!-- 宕机情况 -->
      <template #slot-down-sys="{ row, idx, column }">
        <span class="split-line"></span>
        <span
          :class="[
            (column.isLink && row.dataSource === 2 && type === 'activeUser') ||
            (column.isLink && type !== 'activeUser')
              ? 'sys-name'
              : '',
          ]"
        >
          {{ idx + 1 + "." + row.sysName }}
        </span>
      </template>
      <template #slot-down-count="{ row }">
        <div class="down-time-box">
          <span class="down-count">{{ row.totalDowntimeCount }}</span>
          <div
            class="down-time-tag"
            :style="{ minWidth: row.allCountMaxWidth }"
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
          <span class="down-time">{{ row.totalDowntime }}</span>
          <div class="down-time-tag" :style="{ minWidth: row.allTimeMaxWidth }">
            <span class="down-time-txt">月</span>
            <span class="down-time-val">
              {{ row.monthTotalDowntime || 0 }}
            </span>
          </div>
        </div>
      </template>

      <!-- 访问量情况 -->
      <template #slot-peakHourList="{ row }">
        <div class="peak-period-box" v-if="row.peakHourList.length > 0">
          <span
            v-for="(item, index) in row.peakHourList"
            :key="index"
            class="peak-period-txt"
          >
            {{ item + "点" }}
          </span>
        </div>
        <div v-else>--</div>
      </template>

      <template #expand="{ row }">
        <slot name="expand" :expandRow="row"></slot>
      </template>

      <template #append>
        <div v-if="downMonthData.showTable" class="month-wrap">
          <div class="split-box">
            <span>以下为本月有宕机的其他系统</span>
          </div>
          <div
            class="month-table-wrap"
            v-if="downMonthData.tableData.length > 0"
          >
            <div
              class="month-table-item"
              v-for="(item, index) in downMonthData.tableData"
              :key="index"
            >
              <div class="down-sys-name">
                <span class="split-line"></span>
                <span>
                  {{ index + 1 + "." + item.sysName }}
                </span>
              </div>
              <div class="down-month-count">
                <div
                  class="down-tag-box"
                  :style="{ minWidth: item.allCountMaxWidth }"
                >
                  <span class="down-tag-txt">月</span>
                  <span class="down-tag-val">
                    {{ item.monthTotalDowntimeCount || 0 }}
                  </span>
                </div>
              </div>
              <div class="down-month-time">
                <div
                  class="down-tag-box"
                  :style="{ minWidth: item.allTimeMaxWidth }"
                >
                  <span class="down-tag-txt">月</span>
                  <span class="down-tag-val">
                    {{ item.monthTotalDowntime || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-text">暂无数据</div>
          <div class="footer-box">
            <span>没有更多内容了</span>
          </div>
          <div v-for="item in 40" :key="item" style="opacity: 0">
            {{ item }}
          </div>
        </div>
        <div v-else>
          <div class="footer-box">
            <span>没有更多内容了</span>
          </div>
          <div v-for="item in 40" :key="item" style="opacity: 0">
            {{ item }}
          </div>
        </div>
      </template>
    </card-table>
  </van-floating-panel>
</template>

<script setup>
import {
  ref,
  defineProps,
  defineEmits,
  computed,
  watch,
  nextTick,
  getCurrentInstance,
} from "vue";
import cardTable from "./cardTable.vue";

const { proxy } = getCurrentInstance();
const props = defineProps({
  showAction: {
    type: Boolean,
    default: false,
  },
  tableLoading: {
    type: Boolean,
    default: false,
  },
  // 是否显示扩展行
  isExpand: {
    type: Boolean,
    default: false,
  },
  // 是否显示无更多数据
  footerLine: {
    type: Boolean,
    default: true,
  },
  actionTitle: {
    type: String,
    default: "全部系统",
  },
  type: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请输入系统名称",
  },
  tableColumn: {
    type: Array,
    default: () => [],
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  // 数据是否加载完成
  dataFinished: {
    type: Boolean,
    default: true,
  },
  // 宕机详情月活数据
  downMonthData: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(["update:showAction", "handleCurrentChange"]);

const closeImg = ref(require("@/assets/images/dashBoard/close.svg"));
const filter = ref("");
const anchors = [
  0,
  50,
  Math.round(0.1 * window.innerHeight),
  Math.round(0.2 * window.innerHeight),
  Math.round(0.3 * window.innerHeight),
  Math.round(0.4 * window.innerHeight),
  Math.round(0.5 * window.innerHeight),
  Math.round(0.6 * window.innerHeight),
  Math.round(0.7 * window.innerHeight),
  Math.round(0.8 * window.innerHeight),
  Math.round(0.85 * window.innerHeight),
  Math.round(0.9 * window.innerHeight),
  Math.round(0.95 * window.innerHeight),
  Math.round(1 * window.innerHeight),
];
const actionHeight = ref(anchors[7]);
const isShow = computed({
  get() {
    return props.showAction;
  },
  set(value) {
    emits("update:showAction", value);
  },
});
watch(
  () => actionHeight,
  async (val) => {
    if (val.value <= 0) {
      closeAction();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

nextTick(() => {
  const blockDom = document.querySelector(".van-floating-panel__header"); // 分割线
  const headerDom = document.querySelector(".van-floating-panel__content"); // 分割线
  if (proxy.$isPCBrowser) {
    actionHeight.value = anchors[8];
    blockDom && (blockDom.style.display = "none");
    if (headerDom) {
      headerDom.style["border-top-left-radius"] = "1rem";
      headerDom.style["border-top-right-radius"] = "1rem";
    }
  }
  // let flag = false;
  // console.log("blockDom", blockDom);
  // blockDom.onmousedown = function (e) {
  //   // mainDom.style.display = "block";
  //   if (e.stopPropagation) e.stopPropagation();
  //   if (e.preventDefault) e.preventDefault();
  //   e.cancelBubble = true;
  //   e.returnValue = false;
  //   flag = true;
  //   console.log("e", e);
  //   return;
  //   disx = e.clientX - blockDom.offsetLeft;
  //   console.log("blockDom.offsetLeft", blockDom.offsetLeft);
  //   console.log("disx", disx);
  //   document.onmousemove = function (e) {
  //     if (!flag) return false;
  //     let left = e.clientX - disx;
  //     _this.isCollapse = false;
  //     if (left >= clientW / 3 - blockDom.offsetWidth) {
  //       sideDom.style.width = clientW / 3 - blockDom.offsetWidth + "px";
  //     } else if (left <= 45) {
  //       sideDom.style.width = 45 + "px";
  //       _this.isCollapse = true;
  //     } else {
  //       sideDom.style.width = left + "px";
  //     }
  //   };
  //   document.onmouseup = function (e) {
  //     console.log("mouseup");
  //     flag = false;
  //     // mainDom.style.display = "none";
  //     document.onmousemove = null;
  //     document.onmouseup = null;
  //   };
  //   return false;
  // };
});

const filterTableData = computed(() => {
  if (!filter.value) return props.tableData;
  return props.tableData.filter((i) => {
    let sysName = i.sysName && i.sysName.toUpperCase();
    let serverIp = i.serverIp && i.serverIp.toUpperCase();
    return (
      (sysName && sysName.indexOf(filter.value.toUpperCase()) > -1) ||
      (serverIp && serverIp.indexOf(filter.value.toUpperCase()) > -1)
    );
  });
});

const searchIpt = (val) => {
  filter.value = val;
};

const handleCurrentChange = (row) => {
  emits("handleCurrentChange", row);
};
const sysClick = (row) => {
  console.log("sysClick-->", row);
};
const closeAction = () => {
  isShow.value = false;
};
</script>

<style lang="less" scoped>
.action-sheet-overlay {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}
.floating-panel-wrap {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  z-index: 9999999;
  position: fixed;
  right: 0;
  // left: 50%;
  // transform: translateX(-50%);
  .panel-header {
    text-align: center;
    .header-con {
      position: relative;
      line-height: 40px;
      color: #1d252f;
      font-size: 14px;
      font-weight: 700;
      img {
        position: absolute;
        right: 12px;
        top: 11px;
        cursor: pointer;
      }
    }
  }
}
.table-wrap {
  height: calc(100% - 40px);
  overflow: hidden;
  padding: 0 12px;
  /deep/.el-table {
    height: 100%;
    .el-table__expanded-cell {
      padding: 0;
      border: none;
    }
    .el-table__expand-icon {
      display: none;
    }
    .el-table__body-wrapper {
      // overflow: auto;
      // height: calc(100% - 35px);
    }
  }
}
.month-wrap {
  .split-box {
    margin: 12px 0 12px 0;
    height: 19px;
    line-height: 19px;
    text-align: center;
    position: relative;
    span {
      display: inline-block;
      padding: 0 10px;
      position: relative;
      color: #8d9eae;
      background-color: #fff;
      z-index: 2;
    }
    &::after {
      content: "";
      position: absolute;
      top: 9px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #c4c4c4;
      opacity: 0.4;
      z-index: 1;
    }
  }
  .month-table-wrap {
    .month-table-item {
      display: flex;
      align-items: center;
      height: 32px;
      border-bottom: 1px solid #ebeef5;
      .down-sys-name {
        flex: 1;
        position: relative;
        padding-left: 13px;
        color: #1d2129;
      }
      .down-month-count {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 105px;
        padding-right: 8px;
      }
      .down-month-time {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 110px;
        padding-right: 13px;
      }
      .down-tag-box {
        display: flex;
        align-items: center;
        font-weight: 700;
        margin-left: 6px;
        padding: 3px 4px;
        border-radius: 7px;
        background-color: #eef0fd;
        color: #a6a6a6;
        .down-tag-txt {
          margin-right: 5px;
        }
        .down-tag-val {
          color: #a6a6a6;
        }
      }
    }
    .split-line {
      left: 0;
    }
    .ml-3 {
      margin-left: 3px;
    }
  }
  .empty-text {
    line-height: 60px;
    text-align: center;
    color: #909399;
  }
}
.sys-name {
  text-decoration: underline;
  color: #526ae7;
  cursor: pointer;
}
.split-line {
  position: absolute;
  left: -5px;
  top: 50%;
  display: inline-block;
  width: 5px;
  height: 15px;
  border-radius: 2px;
  background: #526ae7;
  transform: translate(0px, -50%);
}
.down-count,
.down-time {
  color: #526ae7 !important;
  font-size: 14px !important;
  font-weight: 700;
}
</style>
