<template>
  <div class="loading" v-show="visible">
    <div class="loading-box">
      <van-image :width="$px2rem(34)" :height="$px2rem(34)" :src="data.loadingIcon" />
      <p>页面正在加载中，请稍等...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})
const data = reactive({
  loadingIcon: require('@/assets/images/icon-loading.png')
})
</script>

<style lang="less" scoped>
.loading {
  width: 100%;
  max-width: var(--max-width);
  height: 100vh;
  margin: 0 auto;
  text-align: center;
  padding-top: 334px;
  box-sizing: border-box;
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 999;
  .loading-box {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -71px;
    margin-top: -60px;
    p {
      font-size: 12px;
      color: rgb(129, 141, 153);
      margin-top: 24px;
    }
  }
}
</style>
