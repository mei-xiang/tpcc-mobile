<template>
  <div class="card-table">
    <div class="card-title">
      <span>{{ title }}</span>
      <span class="unit-name">{{ unit }}</span>
    </div>
    <div class="top-table" v-if="topTable.length > 0">
      <div class="top-table-box">
        <div
          class="top-table-item"
          v-for="(_item, _index) in topTable"
          :key="_index"
        >
          <div class="table-item-left">
            <span class="table-item-name">{{ _item.name }}</span>
          </div>
          <div class="table-item-right">
            <span class="table-item-value">{{ getVal(_item) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { numThousand, formatMilliseconds } from "@/common/utils/comm";

const props = defineProps({
  topTable: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
  unit: {
    type: String,
    default: "",
  },
});

const getVal = computed(() => {
  return ({ value, type, maxValue }) => {
    if (value === 0) return "0";
    if (!value) return "--";

    if (type === "time") {
      maxValue = maxValue || value
      const maxHours = Math.floor(Math.floor(maxValue / 1000) / 3600);
      return formatMilliseconds(value, maxHours > 0, "cn");
    }
    return numThousand(value);
  };
});
</script>

<style lang="less" scoped>
.card-table {
  font-size: 14px;
  margin-bottom: 10px;
  .card-title {
    position: relative;
    color: #1d252f;
    padding-left: 11px;
    font-weight: 700;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #526ae7;
    }
    .unit-name {
      font-size: 10px;
    }
  }
  .top-table {
    background-color: rgba(243, 243, 243, 0.63);
    padding: 5px;
    border-radius: 10px;
    overflow: hidden;
    .top-table-box {
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      overflow: hidden;
      .top-table-item {
        display: flex;
        align-items: center;
        min-height: 30px;
        background-color: #ffffff;
        padding: 0 9px;
        border-bottom: 1px solid #e5e5e5;
        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: rgba(229, 229, 229, 0.46);
        }
        .table-item-left {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 200px;
          line-height: 28px;
          .table-item-name {
            flex: 1;
            font-size: 13px;
            color: #1d252f;
            line-height: 1.3;
            // white-space: nowrap; /* 不换行 */
            // overflow: hidden; /* 隐藏超出的内容 */
            // text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          }
        }
        .table-item-right {
          display: flex;
          align-items: end;
          flex-direction: column;
          justify-content: space-around;
          margin-left: 5px;

          .table-item-value {
            color: #1d252f;
            font-size: 12px;
            font-weight: 700;
          }
        }
      }
    }
  }
  .no-data {
    color: #808080;
    font-size: 13px;
    line-height: 28px;
    padding-left: 28px;
  }
}
</style>
