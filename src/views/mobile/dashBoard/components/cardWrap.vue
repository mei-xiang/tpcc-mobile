<template>
  <div class="com-wrap">
    <div class="com-header">
      <div class="header-l">
        <img :src="imgSrc" alt="" />
        <span class="header-title">{{ title }}</span>
      </div>
      <div class="header-r"></div>
    </div>
    <div class="com-main">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  imgSrc: {
    type: String,
    default: require("@/assets/images/dashBoard/user.svg")
  }
})
</script>

<style lang="less" scoped>
.com-wrap {
  font-size: 12px;
  .com-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    .header-l {
      display: flex;
      align-items: center;
      img {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
      .header-title {
        font-size: 16px;
        color: #1D252F;
        font-weight: 700;
      }
    }
    .header-r {
      color: rgba(29, 37, 47, 1);
    }
  }
}
</style>
