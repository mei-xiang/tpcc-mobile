<template>
  <div class="card-table">
    <el-table
      ref="tableRef"
      :data="tableData"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      size="small"
      style="width: 100%"
      v-bind="Object.assign({}, $attrs)"
    >
      <!-- 扩展行 -->
      <el-table-column type="expand" v-if="isExpand" width="5px">
        <template #default="{ row }">
          <slot name="expand" :row="row"></slot>
        </template>
      </el-table-column>

      <template v-for="(column, columnIdx) in tableColumn">
        <el-table-column
          v-if="column.type === 'index'"
          type="index"
          v-bind="Object.assign({}, column)"
          :width="getColumnWidth(column.width)"
          :key="`${columnIdx}_${column.label}_index`"
        />
        <el-table-column
          v-else
          v-bind="Object.assign({}, column)"
          :key="`${columnIdx}_${column.prop}_text`"
          :width="getColumnWidth(column.width)"
          :class-name="column.isPlace ? 'sys-more' : ''"
        >
          <template #header="{ row }">
            <slot
              v-if="column.headerSlotName"
              :name="column.headerSlotName"
              :i="columnIdx"
              :row="row"
            ></slot>
            <span v-else>{{ column.label }}</span>
          </template>

          <template #default="{ row, $index }">
            <span v-if="column.isPlace"></span>
            <!-- <img
              v-if="column.isPlace"
              class="sys-icon"
              :src="require('@/assets/images/dashBoard/arrow.png')"
              @click="handleSysClick(row)"
              alt=""
            /> -->
            <!-- <slot
              v-else-if="column.slotName"
              v-bind="{ name: column.slotName, row, i: columnIdx, idx: $index }"
            /> -->
            <slot
              v-else-if="column.slotName"
              :name="column.slotName"
              :row="row"
              :column="column"
              :i="columnIdx"
              :idx="$index"
            ></slot>
            <span v-else>{{ getVal(row, column) }}</span>

            <span class="user-tag-box" v-if="column.isShowTag">
              <span
                v-for="(tag, i) in getTag(row)"
                :key="i"
                :class="['tag-txt']"
              >
                {{ tag }}
              </span>
            </span>
          </template>
        </el-table-column>
      </template>

      <!-- 无数据 -->
      <template #empty>
        <span v-if="dataFinished">暂无数据</span>
        <span v-else></span>
      </template>

      <!-- 无更多数据 -->
      <template #append v-if="footerLine && dataFinished">
        <slot name="append"></slot>
        <!-- <div class="footer-box">
          <span>没有更多内容了</span>
        </div>
        <div v-for="item in 40" :key="item" style="opacity: 0">{{ item }}</div> -->
      </template>
    </el-table>
    <div class="look-more" v-if="isShowMore">
      <span class="look-more-text" @click="handleLookMore">查看全部 >></span>
    </div>
  </div>
</template>

<script setup>
import { ElTable } from "element-plus";
import {
  ref,
  defineProps,
  defineEmits,
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
} from "vue";
import { rem2px, numThousand } from "@/common/utils/comm";
import { debounce } from "lodash";

const { proxy } = getCurrentInstance();
const props = defineProps({
  tableColumn: {
    type: Array,
    default: () => [],
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  tableType: {
    type: String,
    default: "",
  },
  viewAllType: {
    type: [String, Number],
    default: "",
  },
  // 是否显示扩展行
  isExpand: {
    type: Boolean,
    default: false,
  },
  // 是否显示无更多数据
  footerLine: {
    type: Boolean,
    default: false,
  },
  isShowMore: {
    type: Boolean,
    default: true,
  },
  // 数据是否加载完成
  dataFinished: {
    type: Boolean,
    default: true,
  },
});

const tableRef = ref(null);
const emits = defineEmits(["sysClick", "lookMore"]);

const getVal = computed(() => {
  return (row, column) => {
    let val = row[column.prop];
    // isThousand 是否为千分位
    if (val === undefined || val === null) return "--";
    if (val == 0) return 0;
    return (
      (column.isThousand ? numThousand(val) : val) + (column.unit || "") || "--"
    );
  };
});
const getColumnWidth = computed(() => {
  return (width) => {
    if (!width) return "auto";
    return rem2px(proxy.$px2rem(width));
  };
});
const getTag = computed(() => {
  return (row) => {
    if (Reflect.has(row, "dataSource")) {
      return row.dataSource === 2 ? ["埋点"] : ["IP"];
    } else if (Reflect.has(row, "serverLabel")) {
      if (row.serverLabel) {
        return row.serverLabel.split(",");
      }
      return [];
    }
  };
});

const headerCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let obj = props.tableColumn.find((_) => _.prop === column.property);
  return {
    background: obj && obj.headCellBgColor ? obj.headCellBgColor : "#F5F5F5",
    color: "#1D252F",
    height: proxy.$px2rem(35),
    padding: 0,
    fontSize: proxy.$px2rem(12),
    fontWeight: 700,
  };
};
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let obj = props.tableColumn.find((_) => _.prop === column.property);
  return {
    color: obj && obj.bodyCellColor ? obj.bodyCellColor : "#1d2129",
    fontWeight: obj && obj.bodyCellColor ? 700 : 500,
    fontSize: proxy.$px2rem(12),
    height: proxy.$px2rem(28),
    lineHeight: 1.3,
    padding: `${proxy.$px2rem(5)} 0`,
  };
};
const handleSysClick = (row) => {
  emits("sysClick", row);
};
const handleLookMore = () => {
  emits("lookMore", {
    tableType: props.tableType,
    viewAllType: props.viewAllType,
  });
};

const __resizeHandler = debounce(() => {
  tableRef.value && tableRef.value.doLayout();
}, 100);
onMounted(() => {
  window.addEventListener("resize", __resizeHandler);
});
onUnmounted(() => {
  window.removeEventListener("resize", __resizeHandler);
});
</script>

<style lang="less" scoped>
.card-table {
  font-size: 12px;
  color: #1d252f;

  /deep/ .el-table {
    .el-table__cell {
      border-right: none;
    }
    th {
      .cell {
        line-height: 1;
      }
    }

    td {
      &.sys-more {
        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
        }
      }
      .cell {
        line-height: 1.3;
      }
    }

    .sys-icon {
      width: 15px;
      height: 15px;
      color: #c9cdd4;
    }
    .user-tag-box {
      min-width: 30px;
      display: inline-block;
      text-align: left;
      .tag-txt {
        display: inline-block;
        text-align: center;
        min-width: 27px;
        padding: 2px;
        margin: 1px 0 1px 2px;
        font-size: 10px;
        border-radius: 7px;
        color: #a6a6a6;
        background: #eef0fd;
      }
    }

    .peak-period-box {
      display: flex;
      justify-content: flex-end;
      .peak-period-txt {
        display: inline-block;
        text-align: center;
        width: 35px;
        padding: 3px 0;
        border-radius: 7px;
        background: #eef0fd;
        color: #526ae7;
        margin-right: 3px;
        &:last-child {
          margin-right: 0;
        }
      }
    }

    .down-time-box {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .down-time-tag {
        display: flex;
        align-items: center;
        margin-left: 6px;
        padding: 3px 4px;
        border-radius: 7px;
        background-color: #eef0fd;
        color: #a6a6a6;
        .down-time-txt {
          margin-right: 5px;
        }
        .down-time-val {
          color: #a6a6a6;
        }
      }
    }
    .footer-box {
      margin: 50px 0 20px 0;
      height: 19px;
      line-height: 19px;
      text-align: center;
      position: relative;
      span {
        display: inline-block;
        padding: 0 15px;
        position: relative;
        color: #8d9eae;
        background-color: #f1f2f9;
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
  }

  .look-more {
    margin-top: 5px;
    text-align: right;
    .look-more-text {
      cursor: pointer;
    }
  }
}
</style>
