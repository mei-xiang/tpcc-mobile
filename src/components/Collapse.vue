<!-- 折叠面板 -->
<template>
  <div class="collapse-wrap" :class="collapseValue ? 'collapse-open' : 'collapse-close'">
    <div
      class="collapse-header"
    >
      <div class="collapse-title">
        {{ title }}
        <slot name="title"></slot>
      </div>
      <img
        class="collapse-img"
        @click="handCollapse"
        :src="require('@/assets/images/icon-collapse.svg')"
        alt=""
      />
    </div>
    <div class="collapse-main">
      <slot></slot>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
const props = defineProps({
  // collapse 标题
  title: {
    type: String,
    default: ''
  },
  // 是否默认展开，默认不展开
  defaultOpen: {
    type: Boolean,
    default: false
  }
})
const collapseValue = ref(props.defaultOpen)
const handCollapse = () => {
  collapseValue.value = !collapseValue.value
}
</script>
<style lang="less" scoped>
.collapse-wrap {
  border-radius: 10px;
  background-color: #fff;
  padding: 0 16px;
  &.collapse-open{
    .collapse-main{
      display: block;
      height: auto;
    }
  }
  &.collapse-close{
    .collapse-main{
      display: none;
      height: 0px !important;
      overflow: hidden;
    }
    .collapse-img {
      transform: rotate(-90deg);
    }
  }

  .collapse-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    .collapse-title {
      font-size: 16px;
      color: #1d252f;
      font-weight: bold;
      flex-grow: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
    }
    .collapse-img {
      height: 28px;
      width: 28px;
      border: none;
      display: block;
      padding: 4px;
      flex-shrink: 0;
    }
  }
  .collapse-main {
    padding: 16px 0;
  }
}
</style>
