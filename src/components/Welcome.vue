<template>
  <div v-if="imageType" class="content">
    <div class="img-box">
      <div class="img1"><div class="img2" /></div>
    </div>
    <p>项目管理系统正在加载中，请稍后...</p>
    <div class="logo" />
  </div>
</template>

<script setup>
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  watch
} from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  imageType: Boolean
})
const { proxy } = getCurrentInstance()
const data = reactive({
  imageType: true,
  isPad: proxy.$isPad
})
onMounted(() => {})
watch(
  () => props.imageType,
  (res) => {
    data.imageType = res
  }
)
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  max-width: var(--max-width);
  height: 100vh;
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: 190px;
  background-color: #fff;
  text-align: center;
  .img1 {
    width: 282px;
    height: 237px;
    margin: 0 auto;
    background-image: url('@/assets/images/theme.png');
    background-size: auto 100%;
    background-position-x: center;
    position: relative;
    .img2 {
      width: 68px;
      height: 68px;
      position: absolute;
      left: 50%;
      top: -40px;
      margin-left: -34px;
      background-image: url('@/assets/images/logo.png');
      background-size: auto 100%;
      background-position-x: center;
    }
  }
  p {
    font-size: 12px;
    color: rgb(133, 150, 166);
  }
  .logo {
    width: 110px;
    height: 48px;
    position: fixed;
    left: 50%;
    bottom: 48px;
    margin-left: -55px;
    background-image: url('@/assets/images/zhidiLogo.png');
    background-size: 100%;
    background-position-x: center;
  }
}
</style>
