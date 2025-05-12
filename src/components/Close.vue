<template>
  <div class="close-wrapper">
    <div
      class="close-btn"
      @click="hanldClose"
      :style="{ background: btnBgColor }"
    >
      <img src="../assets/images/icon/icon_close.png" alt="" />
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue'
import { exitApp } from '@/common/utils/comm'

const props = defineProps({
  btnBgColor: {
    type: String,
    default: '#fff'
  }
})
const data = reactive({})
const hanldClose = () => {
  exitApp()
}
defineExpose({ hanldClose })
</script>

<style lang="less" scoped>
.close-wrapper {
  .close-btn {
    width: 24px;
    height: 24px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
