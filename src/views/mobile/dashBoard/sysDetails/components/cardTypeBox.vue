<template>
  <div class="card-data">
    <div
      v-for="item in cardList"
      :class="['card-item', { active: item.id === cardId }]"
      :key="item.id"
      @click="handleCard(item)"
    >
      <div class="card-left">
        <div class="card-head">
          <span class="card-name">{{ item.name }}</span>
          <van-popover
            :key="item.id"
            v-model:show="item.showPopover"
            close-on-click-outside
            placement="bottom"
            class="popover-wrap"
            :offset="[20, 8]"
          >
            <span v-html="item.tip"></span>
            <template #reference>
              <div class="tip-img" v-if="item.tip"></div>
            </template>
          </van-popover>
        </div>

        <div class="card-val">
          <span class="card-val-num">{{ getVal(item) }}</span>
          <span class="card-val-unit" v-if="item.showUnit">
            {{ item.unit }}
          </span>
        </div>
      </div>

      <div class="card-right">
        <span :class="['card-rate-tag', getRateClass(item)]">
          {{ getRateVal(item) }}
        </span>
        <span class="card-rate-txt">{{ item.rateTxt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
  computed,
} from "vue";
import { numThousand, formatMilliseconds, numParse } from "@/common/utils/comm";

const props = defineProps({
  cardList: {
    type: Array,
    default: () => [],
  },
  cardId: {
    type: String,
    default: "dailyActiveUserCount",
  },
});
const emits = defineEmits(["handleCard", "update:cardId"]);

const handleCard = (item) => {
  if (item.id === props.cardId) return false;
  // item.showPopover = false;
  emits("update:cardId", item.id);
  emits("handleCard", item);
};
const getVal = computed(() => {
  return ({ value, isNumThousand, isCnTime, isParseUnit }) => {
    if (value === undefined || value === null || value === "") {
      return "--";
    }
    if (value == 0) {
      return "0";
    }
    if (isCnTime) {
      const hours = Math.floor(Math.floor(value / 1000) / 3600);
      return formatMilliseconds(value, hours > 0);
    }
    if (isParseUnit) {
      if (value > 10000) {
        const unit = "万";
        value = parseFloat((Number(value) / 1e4).toFixed(2));
        return isNumThousand ? numThousand(value) + unit : value + unit;
      }
    }
    value = parseFloat(Number(value).toFixed(2));
    return isNumThousand ? numThousand(value) : value;
  };
});
const getRateVal = computed(() => {
  return ({ rateVal, rateUnit, showUnit, isCnTime }) => {
    if (rateVal === undefined || rateVal === null || rateVal === "") {
      return "--";
    }
    if (rateVal == 0) {
      return "+0";
    }
    if (isCnTime) {
      const hours = Math.floor(Math.floor(rateVal / 1000) / 3600);
      return `${rateVal > 0 ? "+" : "-"}${formatMilliseconds(
        rateVal,
        hours > 0
      )}`;
    }
    let sign = "";
    let unit = showUnit ? rateUnit || "%" : "";
    sign = rateVal > 0 ? "+" : "";
    rateVal = parseFloat(Number(rateVal).toFixed(2));
    return `${sign}${rateVal}${unit}`;
  };
});

const getRateClass = computed(() => {
  return ({ rateVal }) => {
    if (rateVal === undefined || rateVal === null || rateVal === "") {
      return "";
    }
    if (rateVal == 0) {
      return "";
    }
    return rateVal > 0 ? "increase-rate" : "decrease-rate";
  };
});

const __clickHandler = (e) => {
  if (e.target.className === "tip-img") return;
  props.cardList.forEach((_) => {
    _.showPopover = false;
  });
};
onMounted(() => {
  document.body.addEventListener("click", __clickHandler);
});
onUnmounted(() => {
  document.body.removeEventListener("click", __clickHandler);
});
</script>

<style lang="less" scoped>
.card-data {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom: 0;
  width: 100%;
  .card-item {
    display: flex;
    text-align: center;
    justify-content: space-around;
    // justify-content: center;
    width: 48.5%;
    border-radius: 5px;
    margin-right: 9px;
    margin-bottom: 7px;
    font-size: 12px;
    padding: 7px 0;
    background-color: rgba(229, 229, 229, 0.26);
    cursor: pointer;
    &.active,
    &:hover {
      background-color: #526ae7;
      .card-left {
        .card-head {
          .card-name {
            color: #ffffff;
          }
        }
        .card-val {
          .card-val-num,
          .card-val-unit {
            color: #ffffff;
          }
        }
      }
      .card-right {
        .card-rate-txt {
          color: #ffffff;
        }
      }
      /deep/.van-popover__wrapper {
        .tip-img {
          cursor: pointer;
          background-image: url("@/assets/images/dashBoard/active-question.svg");
        }
      }
    }
    &:nth-child(2n) {
      margin-right: 0;
    }
    .card-left {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      .card-head {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 85px;
        margin-bottom: 4px;
        .card-name {
          color: #1d252f;
          margin-right: 2px;
        }
      }
      .card-val {
        .card-val-num {
          font-size: 18px;
          font-weight: 700;
          color: #526ae7;
        }
        .card-val-unit {
          color: #526ae7;
        }
      }
    }
    .card-right {
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 16px;
      flex-direction: column;
      .card-rate-txt {
        color: #8d9eae;
        margin-right: 5px;
      }
      .card-rate-tag {
        font-weight: 700;
        border-radius: 5px;
        background: #ffffff;
        border: 1px solid #e8edf2;
        padding: 0 4px;
        margin-bottom: 2px;
      }
      .increase-rate {
        color: #f05f5f;
      }
      .decrease-rate {
        color: #66900f;
      }
    }
    /deep/.van-popover__wrapper {
      width: 12px;
      height: 12px;
      .tip-img {
        width: 12px;
        height: 12px;
        cursor: pointer;
        background-image: url("@/assets/images/dashBoard/question.svg");
        background-repeat: repeat;
        background-size: 100% 100%;
      }
    }
  }
}

@media screen and (max-width: 700px) {
  .card-data {
    .card-item {
      .card-right {
        .card-rate-tag {
          max-width: 70px;
          padding: 0 2px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.popover-wrap {
  max-width: 220px;
  .van-popover__arrow {
    top: 1px !important;
  }
  .van-popover__content {
    white-space: pre-line;
    font-size: 12px;
    margin: 0;
    padding: 4px;
  }
}
</style>
