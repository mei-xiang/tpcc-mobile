<template>
  <div class="card-main">
    <div class="card-header" v-if="showHeader">
      <template v-if="headerSlot">
        <slot name="header"></slot>
      </template>
      <div class="header-l" v-else>
        <span class="title-line"></span>
        <div class="card-title">{{ cardTitle }}</div>
        <van-popover
          v-model:show="showPopover"
          close-on-click-outside
          :placement="placement"
          class="van-popover-wrap"
        >
          <slot name="tip"></slot>
          <template #reference>
            <img
              v-if="showTip"
              :src="require('@/assets/images/dashBoard/question.svg')"
              alt=""
              class="tip-img"
            />
          </template>
        </van-popover>
      </div>
      <div class="header-r"></div>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true,
  },
  headerSlot: {
    type: Boolean,
    default: false,
  },
  showTip: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: 'right',
  },
  cardTitle: {
    type: String,
    default: "",
  },
});
const showPopover = ref(false);
const __clickHandler = (e) => {
  if (e.target.className === "tip-img") return;
  showPopover.value = false;
};

onMounted(() => {
  document.body.addEventListener("click", __clickHandler);
});
onUnmounted(() => {
  document.body.removeEventListener("click", __clickHandler);
});
</script>

<style lang="less" scoped>
.card-main {
  width: 100%;
  font-size: 12px;
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    line-height: 32px;
    .header-l {
      display: flex;
      align-items: center;
      margin: 5px 0;
      .title-line {
        width: 5px;
        height: 12px;
        border-radius: 5px;
        background: #526ae7;
      }
      .card-title {
        margin: 0 2px 0 4px;
        font-size: 14px;
        font-weight: 700;
        color: #1d252f;
      }
      /deep/.van-popover__wrapper {
        display: flex;
      }
      .tip-img {
        cursor: pointer;
        width: 12px;
        height: 12px;
      }
    }
    .header-r {
      color: rgba(29, 37, 47, 1);
    }
  }
  .card-body {
    width: 100%;
  }
}
.mb-17 {
  margin-bottom: 17px;
}
</style>

<style lang="less">
.van-popover-wrap {
  max-width: 300px;
  .van-popover__arrow {
    top: 50% !important;
  }
}
.popover-content {
  white-space: pre-wrap;
  white-space: pre-line;
  font-size: 12px;
  margin: 0;
  padding: 4px;
  > div {
    margin-bottom: 6px;
    &:last-child {
      margin-bottom: 0;
    }
    .font-bold {
      font-weight: 700;
    }
  }
}
</style>
