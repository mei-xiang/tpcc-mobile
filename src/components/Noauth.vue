<template>
  <div class="auth" v-show="visible">
    <div class="img">
      <img :src="authImg" alt="" />
    </div>
    <div class="info1">暂无权限</div>
    <div class="info2">
      您暂无TPCC系统权限，如需申请权限，请联系系统管理员。
    </div>
    <div class="btn" @click="close">返回</div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, getCurrentInstance, watch } from 'vue'
import authImg from '@/assets/images/auth.png'

export default {
  name: 'noAuth',

  setup(props) {
    const { proxy } = getCurrentInstance()
    const data = reactive({
      authImg,
      visible: false,
      close: () => {
        sessionStorage.clear()
        localStorage.clear()
        window.h5sdk?.biz?.navigation?.close({
          onSuccess: function (result) {}
        })
      },
      showNoAuth: () => {
        data.visible = true
      }
    })
    onMounted(() => {})

    return {
      ...toRefs(data)
    }
  }
}
</script>

<style lang="less" scoped>
.auth {
  width: 100%;
  height: 100%;
  background: #ffffff;
  position: fixed;
  z-index: 999999989;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  .img {
    text-align: center;
    margin-top: 30%;
    img {
    }
  }
  .info1 {
    color: #1d252f;
    font-size: 18px;
    text-align: center;
    line-height: 23px;
    font-weight: 500;
    margin-top: 30px;
  }
  .info2 {
    width: 246px;
    height: 36px;
    text-align: center;
    margin: 0 auto;
    color: #455467;
    font-size: 14px;
    line-height: 18px;
    font-weight: 400;
    padding-top: 10px;
  }
  .btn {
    width: 311px;
    height: 50px;
    color: #ffffff;
    text-align: center;
    background: rgba(255, 162, 0, 1);
    background-blend-mode: normal;
    border-radius: 5px;
    font-size: 16px;
    line-height: 50px;
    mix-blend-mode: normal;
    margin: 80px auto;
  }
}
</style>
