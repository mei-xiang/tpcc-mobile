<template>
  <div class="container">
    没有权限
  </div>
</template>

<script>
import { onMounted, reactive, toRefs } from 'vue'
export default {
  name: '',
  components: {
  },
  setup () {
    const data = reactive({

    })
    onMounted(() => {

    })
    return {
      ...toRefs(data)
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
