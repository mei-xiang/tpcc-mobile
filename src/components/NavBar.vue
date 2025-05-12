<template>
  <van-nav-bar :class="isIphone ? 'iphone' : ''">
    <template #left v-if="leftBtn">
      <template v-if="slotLeft">
        <slot name="nav-left"></slot>
      </template>
      <van-image v-else :width="$px2rem(22)" :height="$px2rem(22)" :src="data.leftIcon" @click="goBack" />
    </template>

    <template #title v-if="navCenter">
      <template v-if="slotCenter">
        <slot name="nav-center"></slot>
      </template>
      <span v-else>{{ title }}</span>
    </template>
    
    <!-- 自定义右侧区域 -->
    <template #right v-if="rightBtn">
      <template v-if="slotRight">
        <slot name="nav-right"></slot>
      </template>
      <close v-else class="right-close" btnBgColor="#f1f3f7" ref="closeBtn" />
    </template>
  </van-nav-bar>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { exitApp } from '@/common/utils/comm'

import Close from './Close.vue'
const isIphone = false
const router = useRouter()
const route = useRoute()
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  leftBtn: {
    type: Boolean,
    default: true
  },
  // 左侧插槽
  slotLeft: {
    type: Boolean,
    default: false
  },
  navCenter: {
    type: Boolean,
    default: true
  },
  // 中间插槽
  slotCenter: {
    type: Boolean,
    default: false
  },
  rightBtn: {
    type: Boolean,
    default: true
  },
  // 右侧插槽
  slotRight: {
    type: Boolean,
    default: true
  },
  // 是否返回上一个页面
  isBack: {
    type: Boolean,
    default: false
  }
})
const closeBtn = ref(null)
const data = reactive({
  leftIcon: require('@/assets/images/icon/back2.png')
})
const goBack = () => {
  // if (['toDoList', 'Tsheets', 'approval', 'dashBoard'].includes(route.name)) {
  //   exitApp()
  // } else if (props.isBack) {
  //   router.back()
  // } else {
  //   router.push('/toDoList')
  // }
  if (props.isBack) {
    router.back()
  } else {
    exitApp()
  }
}
</script>

<style lang="less" scoped>
.iphone {
  padding-top: 20px;
}
.right-close {
  margin-left: 20px;
}
</style>
