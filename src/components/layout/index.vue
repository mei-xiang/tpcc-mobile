<template>
  <div>123</div>
</template>
<script name="Layout">
import {
  onMounted,
  readonly,
  provide,
  reactive,
  toRefs,
  nextTick,
  watch
} from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const data = reactive({
      active: 0,
      getRef: null,
      navVisable: true,
      touchMove() {
        /* let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        let ref = document.querySelector('.navVisable')
        if (scrollTop >= 10) {
         // ref.setAttribute("class",'hide' );
          data.navVisable = false; //隐藏元素
        }
        if (scrollTop < 10) {
          data.navVisable = true; //显示元素
        } */
        // sessionStorage.setItem('touchMove', data.navVisable)
        // console.log(data.navVisable)
        // console.log(ref,1111111);
      }
    })

    onMounted(() => {
      window.addEventListener('scroll', data.touchMove)
    })
    watch(
      () => router.value,
      (res) => {}
    )
    provide('touchMove', readonly(data)) // 存入获取到的接口数据，去子组件用 inject('data') 取值
    return {
      ...toRefs(data),
      router
    }
  }
}
</script>
<style lang="less" scoped></style>
