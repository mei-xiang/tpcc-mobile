<template>
  <div class="page-analysis-card">
    <div class="card-title">最长加载时间分析</div>
    <div class="time-box">
      <div class="time-item">
        <span class="time-label">总时间</span>
        <div class="time-value">
          <div class="time-progress-bar">
            <span>
              {{ msTOsecond(fScreenLoadTime.maxTimeUba) + "秒" }}
            </span>
          </div>
        </div>
      </div>
      <div class="time-item">
        <span class="time-label">前端渲染</span>
        <div class="time-value">
          <div
            v-if="calcFrontTimeRate > 0"
            class="time-progress-bar inter-bar-left"
            :style="{ width: calcFrontTimeRate + '%' }"
          >
            <span class="time-text-l">
              {{ msTOsecond(fScreenLoadTime.maxTimeDomUba) + "秒" }}
            </span>
          </div>
          <span v-else>
            {{ msTOsecond(fScreenLoadTime.maxTimeDomUba) + "秒" }}
          </span>
        </div>
      </div>
      <div class="time-item">
        <span class="time-label">后端加载</span>
        <div
          :class="['time-value', { 'outer-bar-right': calcAdminTimeRate > 0 }]"
        >
          <div
            v-if="calcAdminTimeRate > 0"
            class="time-progress-bar inter-bar-right"
            :style="{ width: calcAdminTimeRate + '%' }"
          >
            <span class="time-text-r">
              {{ msTOsecond(fScreenLoadTime.maxTimeServeUba) + "秒" }}
            </span>
          </div>
          <span v-else>
            {{ msTOsecond(fScreenLoadTime.maxTimeServeUba) + "秒" }}
          </span>
        </div>
      </div>
      <div class="time-item">
        <span class="time-label">页面名称</span>
        <div class="time-value">
          <span
            v-if="!fScreenLoadTime.maxTimePageUba"
            class="popover-page-name"
          >
            --
          </span>
          <van-popover
            v-else
            v-model:show="showPagePopover"
            placement="top-end"
            class="load-time-popover"
          >
            <span>{{ fScreenLoadTime.maxTimePageUba }}</span>
            <template #reference>
              <span class="popover-page-name">
                {{ fScreenLoadTime.maxTimePageUba }}
              </span>
            </template>
          </van-popover>
        </div>
      </div>
      <div class="time-item">
        <span class="time-label">用户名称</span>
        <div class="time-value">
          <span
            v-if="
              !fScreenLoadTime.maxTimeNameUba &&
              !fScreenLoadTime.maxTimeUserIdUba
            "
            class="popover-user-name"
            >--
          </span>
          <van-popover
            v-else
            v-model:show="showUserPopover"
            placement="top-end"
            class="load-time-popover"
          >
            <span>{{ resUserName }}</span>
            <template #reference>
              <span class="popover-user-name">{{ resUserName }}</span>
            </template>
          </van-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  fScreenLoadTime: {
    type: Object,
    default: () => {},
  },
});
const showPagePopover = ref(false);
const showUserPopover = ref(false);

const calcFrontTimeRate = computed(() => {
  let total = props.fScreenLoadTime.maxTimeUba || 0;
  if (!total || !props.fScreenLoadTime.maxTimeDomUba) return 0;

  let serverTime = props.fScreenLoadTime.maxTimeServeUba || 0;
  return ((total - serverTime) * 100) / total;
});
const calcAdminTimeRate = computed(() => {
  if (!props.fScreenLoadTime.maxTimeServeUba) return 0;

  return 100 - calcFrontTimeRate.value;
});

const resUserName = computed(() => {
  let userName = props.fScreenLoadTime.maxTimeNameUba;
  let userId = props.fScreenLoadTime.maxTimeUserIdUba;
  return userName && userId
    ? userName + "(" + userId + ")"
    : userName && !userId
    ? userName
    : userId && !userName
    ? userId
    : "--";
  // return `${props.fScreenLoadTime.maxTimeNameUba || "--"}(${
  //   props.fScreenLoadTime.maxTimeUserIdUba || "--"
  // })`;
});
const msTOsecond = (time) => {
  return time ? parseFloat((time / 1000).toFixed(2)) : 0;
};

const __clickPageHandler = (e) => {
  if (e.target.className === "popover-page-name") return;
  showPagePopover.value = false;
};
const __clickUserHandler = (e) => {
  if (e.target.className === "popover-user-name") return;
  showUserPopover.value = false;
};

onMounted(() => {
  document.body.addEventListener("click", __clickPageHandler);
  document.body.addEventListener("click", __clickUserHandler);
});
onUnmounted(() => {
  document.body.removeEventListener("click", __clickPageHandler);
  document.body.removeEventListener("click", __clickUserHandler);
});
</script>

<style lang="less" scoped>
.page-analysis-card {
  height: 100%;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid rgba(229, 229, 229, 0.8);
  .card-title {
    text-align: center;
    margin-bottom: 12px;
  }
  .time-box {
    .time-item {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin-bottom: 7px;
      height: 16px;
      line-height: 16px;
      .time-label {
        width: 45px;
        margin-right: 10px;
        text-align: right;
        font-size: 11px;
      }
      .time-value {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        white-space: nowrap; /* 不换行 */
        overflow: hidden; /* 隐藏超出的内容 */
        text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
        position: relative;
        min-height: 100%;
        &.outer-bar-right {
          display: flex;
          justify-content: flex-end;
        }
        .time-progress-bar {
          position: relative;
          width: 100%;
          height: 16px;
          
          padding-right: 4px;
          border-radius: 10px;
          text-align: right;
          background: rgba(166, 166, 166, 0.85);
          &.inter-bar-left {
            background: #688ff4;
          }
          &.inter-bar-right {
            background: rgba(190, 217, 132, 0.84);
          }

          .time-text-l {
            position: absolute;
            left: 4px;
            transform: translateY(0.5px);
          }
          .time-text-r {
            position: absolute;
            right: 4px;
            transform: translateY(0.5px);
          }
        }
        /deep/ .van-popover__wrapper {
          position: absolute;
          height: 100%;
          max-width: 100%;
        }
        .popover-user-name,
        .popover-page-name {
          cursor: pointer;
          display: inline-block;
          font-size: 11px;
          width: 100%;
          white-space: nowrap; /* 不换行 */
          overflow: hidden; /* 隐藏超出的内容 */
          text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
        }
      }
    }
  }
}
</style>
<style lang="less">
.load-time-popover {
  max-width: 200px;
  // max-width: 100px;
  .van-popover__arrow {
    border-top-color: #ddd9d9 !important;
  }
  .van-popover__content {
    white-space: pre-line;
    font-size: 11px;
    margin: 0;
    padding: 4px;
    background: #f7f7f7;
    border: 1px solid #b3b3b3;
  }
}
</style>
