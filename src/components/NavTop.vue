<template>
  <div class="headers-wrap">
      <NavBar :title="title" :rightBtn="rightBtn" />

    <slot></slot>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { NavBar } from '@/components/index'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  rightBtn: {
    type: Boolean,
    default: true
  }
})
const data = reactive({
  loadingIcon: require('@/assets/images/icon-loading.png')
})
</script>

<style lang="less" scoped>
.headers-wrap{
    width: 100%;
    height: 125px;
    background-image: url('../assets/images/img-bg.png');
    background-repeat: repeat;
    background-size: 100% 100%;
    box-sizing: border-box;
    // position: relative;
    // bottom: constant(safe-area-inset-top);
    // bottom: env(safe-area-inset-top);
    // padding-top: constant(safe-area-inset-top); /* 兼容 Safari */
    // padding-top: env(safe-area-inset-top); /* 兼容其他浏览器 */
    :deep(.van-nav-bar){
      background-color: rgba(0,0,0,0);
      border-bottom: none;
      box-shadow: none;
      &::after{
        border: none;
      }
    }
}

</style>
