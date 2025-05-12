<template>
  <div class="card-head">
    <div class="head-type" v-for="(item, idx) in fieldList" :key="idx">
      <div class="title-type-box">
        <div class="type-text">{{ item.name }}</div>
        <div class="type-val">
          <span>{{ getVal(item) }}</span>
          <span v-if="item.unit" class="type-unit">{{ item.unit }}</span>
          <span v-if="item.isShowTag" class="tag-txt">{{ "IP" }}</span>
        </div>
      </div>
      <div class="compare-box" v-if="!item.isHideFloat">
        <span :class="['float-val', getFloatClass(item)]">
          {{ getFloatVal(item) }}
        </span>
        <span class="compare-text">较上日{{ item.isHideFloat }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { numThousand } from "@/common/utils/comm";

const props = defineProps({
  fieldList: {
    type: Array,
    default: () => [],
  },
});

const getVal = computed(() => {
  return ({ val, numUnit, isShowSecond }) => {
    if (val === undefined || val === null || val === "") {
      return "--";
    }
    if (val == 0) {
      return "0";
    }
    let unit = numUnit ? numUnit : "";
    if (isShowSecond) {
      return `${msParseM(val)}${unit}`;
    }
    return `${val}${unit}`;
  };
});
const getFloatVal = computed(() => {
  return ({ floatVal, floatUnit, isShowSecond }) => {
    let sign = "";
    let unit = floatUnit || "%";
    if (floatVal === undefined || floatVal === null || floatVal === "") {
      return "--";
    }
    if (floatVal == 0) {
      return "+0";
    }
    sign = floatVal > 0 ? "+" : "";
    if (isShowSecond) {
      return `${sign}${msParseM(floatVal)}${unit}`;
    }
    return `${sign}${floatVal}${unit}`;
  };
});
const getFloatClass = computed(() => {
  return ({ floatVal }) => {
    if (floatVal === undefined || floatVal === null || floatVal === "") {
      return "";
    }
    if (floatVal == 0) {
      return "";
    }
    return floatVal > 0 ? "increase-float" : "decrease-float";
  };
});
const msParseM = (val) => {
  if (!val) return 0;
  val = val - 0;
  return numThousand(parseFloat((val / 1000).toFixed(2)));
};
</script>

<style lang="less" scoped>
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 53px;
  border-radius: 5px;
  background: #e3ecfa;
  padding: 6px;
  font-size: 10px;
  color: #1d252f;
  margin-bottom: 5px;
  .head-type {
    display: flex;
    justify-content: space-between;
    .title-type-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 10px;
      .type-text {
        margin-bottom: 4px;
        font-weight: 700;
      }
      .type-val {
        font-size: 18px;
        color: #526ae7;
        font-weight: 700;
        .type-unit {
          color: #455467;
          font-size: 10px;
        }
        .tag-txt {
          padding: 0 3px;
          font-size: 10px;
          border-radius: 7px;
          color: #a6a6a6;
          background: #eef0fd;
        }
      }
    }
    .compare-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      transform: translateY(-3px);
      .float-val {
        color: #1d252f;
        margin-bottom: 1px;
        font-weight: 700;
        text-align: center;
      }
      .increase-float {
        color: #f05f5f;
      }
      .decrease-float {
        color: #66900f;
      }
      .compare-text {
        font-weight: 700;
      }
    }
  }
}
</style>
