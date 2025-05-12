<template>
  <div class="card-wrap">
    <div class="card-header">
      <div class="card-title">{{ title }}<span v-if="isStar" class="is-required">*</span></div>
      <div class="card-collapse" :class="activeCollapse ? '':'active'" v-if="isCollapse" @click="handCollapse">
        <svg viewBox="0 0 24 24" fill="none"><g opacity="1"  transform="translate(0 0)"><path  fill-rule="evenodd" style="fill:#F1F3F7" opacity="1" d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0Z"></path><g opacity="1"  transform="translate(4 4)"><path d="M0 16L16 16L16 0L0 0L0 16Z"  ></path><path id="三角形 1" fill-rule="evenodd" style="fill:#000000" opacity="1" d="M11.28 5.75146L4.72 5.75146C4.01 5.75146 3.65 6.60146 4.15 7.11146L7.43 10.4315C7.74 10.7515 8.26 10.7515 8.57 10.4315L11.85 7.11146C12.35 6.60146 11.99 5.75146 11.28 5.75146Z"></path></g></g></svg>
      </div>
    </div>
    <div class="card-main" :class="activeCollapse ? '':'heigh-0'">
      <slot></slot>
    </div>
    <div class="remarks" :class="activeCollapse ? '':'posi'" v-if="remarks">{{ remarks }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  // 标题名称
  title: {
    type: [String, Number],
    required: true
  },
  // 是否显示红色 *
  isStar: {
    type: Boolean,
    default: false
  },
  // 是否显示折叠按钮
  isCollapse: {
    type: Boolean,
    default: true
  },
  // 折叠面板状态
  collapse: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    default: ''
  }
})
const activeCollapse = ref(props.collapse)
const handCollapse = () => {
  activeCollapse.value = !activeCollapse.value
}
</script>

<style lang="less" scoped>
.card-wrap{
  background-color: #fff;
  border-radius: 10px;
  padding: 0px 16px;
  position: relative;
  margin-bottom: 16px;
  .card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 60px;
    .card-title{
      color: #1D252F;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      .is-required{
        color: #FF5733;
        padding: 0px 3px;
        line-height: 20px;
      }
    }
    .card-collapse{
      width: 24px;
      height: 24px;
      >svg{
        width: 100%;
        height: 100%;
      }
      &.active{
        transform: rotate(-90deg);
      }
    }
  }
  .card-main{
    padding-bottom: 16px;
    box-sizing: border-box;
    height: auto;
    transition: height 0.3s ease-in-out;
    &.heigh-0{
      height: 0px;
      padding-bottom: 0px;
      transition: height 0.3s ease-in-out;
      overflow: hidden;
    }
  }
  .remarks{
    font-size: 10px;
    line-height: 15px;
    color: #8D9EAE;
    width: 100%;
    box-sizing: border-box;
    padding: 0px 16px;
    position: absolute;
    left: 0px;
    bottom: 4px;
  }
}
</style>
