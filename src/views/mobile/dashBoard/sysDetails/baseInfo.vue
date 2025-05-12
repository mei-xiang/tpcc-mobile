<template>
  <!-- 基础信息 -->
  <div class="card-analysis" id="baseInfo">
    <div v-if="isFirstTab" ref="borderLTopRef" class="border-left-top"></div>
    <div v-if="isFirstTab" ref="borderRTopRef" class="border-right-top"></div>
    <card-wrap :class="['card-wrap', { 'radius-wrap': isFirstTab }]" title="基础信息" :imgSrc="imgSrc">
      <template #default>
        <card-main :showHeader="false">
          <div>
            <div class="base-item">
              <div class="base-item-title">负责人</div>
              <div class="base-item-val">
                {{ baseInfo.userName }}（{{ baseInfo.userLdap }}）
              </div>
            </div>
            <div class="base-item">
              <div class="base-item-title">系统全称</div>
              <div class="base-item-val">
                <span>{{ baseInfo.sysName || "--" }}</span>
                <span class="base-item-tag">
                  {{ baseInfo.sysCode || "--" }}
                </span>
              </div>
            </div>
            <div class="base-item">
              <div class="base-item-title">所属组</div>
              <div class="base-item-val">
                {{ baseInfo.groupName || "--" }}
              </div>
            </div>
            <div class="base-item">
              <div class="base-item-title">上线时间</div>
              <div class="base-item-val">
                {{ baseInfo.onlineDate || "--" }}
              </div>
            </div>
            <div class="base-item">
              <div class="base-item-title">业务介绍</div>
              <div class="base-item-val">
                {{ baseInfo.description || "--" }}
              </div>
            </div>
          </div>
        </card-main>
      </template>
    </card-wrap>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import cardWrap from "../components/cardWrap.vue";
import cardMain from "../components/cardMain.vue";

defineOptions({
  inheritAttrs: false,
});
const { proxy } = getCurrentInstance();
const props = defineProps({
  baseInfo: {
    type: Object,
    default: () => {},
  },
  // 是否为第一个tab
  isFirstTab: {
    type: Boolean,
    default: false,
  },
});
const imgSrc = ref(require("@/assets/images/dashBoard/base-info.svg"));
const borderLTopRef = ref(null);
const borderRTopRef = ref(null);

onMounted(() => {
  if (proxy.$isIphone) {
    borderLTopRef.value && (borderLTopRef.value.style.display = "none");
    borderRTopRef.value && (borderRTopRef.value.style.display = "none");
  }
});
</script>

<style lang="less" scoped>
.card-analysis {
  .card-wrap {
    .base-item {
      display: flex;
      flex-direction: column;
      color: #1d252f;
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
      .base-item-title {
        position: relative;
        font-size: 13px;
        font-weight: 700;
        padding-left: 10px;
        line-height: 20px;
        &::before {
          position: absolute;
          content: "";
          left: 0;
          top: 3px;
          width: 5px;
          height: 12px;
          border-radius: 5px;
          background: #526ae7;
        }
      }
      .base-item-val {
        display: flex;
        align-items: center;
        font-size: 12px;
        .base-item-tag {
          height: 20px;
          line-height: 20px;
          padding: 0 8px;
          border-radius: 5px;
          background: #f5f5f5;
          margin-left: 9px;
        }
      }
    }
  }
}
</style>
