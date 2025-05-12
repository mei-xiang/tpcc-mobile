<template>
  <template v-if="tsheetsList && tsheetsList.length > 0 && !loading">
    <div class="content-card-wrap" v-for="i in tsheetsList" :key="i.id">
      <div class="content-card-item">
        <div class="iten-name">
          <span class="red-style">*&nbsp;</span>
          <span>工时类型</span>
        </div>
        <div class="iten-content">{{ getTypeName(i.workingType) }}</div>
      </div>

      <div class="content-card-item">
        <div class="iten-name">
          <span class="red-style">*&nbsp;</span>
          <span>系统名称</span>
        </div>
        <div class="iten-content">{{ i.spfSysInfoName }}</div>
      </div>

      <div class="content-card-item">
        <div class="iten-name">
          <span class="red-style">*&nbsp;</span>
          <span>所属项目</span>
        </div>
        <div class="iten-content">{{ i.projectName }}</div>
      </div>

      <div class="content-card-item">
        <div class="iten-name">
          <span class="red-style">*&nbsp;</span>
          <span>天数</span>
        </div>
        <div class="iten-content">{{ i.number }}</div>
      </div>

      <!-- <div class="content-card-item">
        <div class="iten-name">
          <span>工作内容</span>
        </div>
        <div class="iten-content">{{ i.content || '--' }}</div>
      </div> -->
    </div>
  </template>
  <van-empty v-else description="暂无数据" v-loading="loading" />
</template>
<script setup>
import { tsTypeOptions } from '../config/options'

const props = defineProps({
  tsheetsList: {
    type: Array,
    default: () => {
      return []
    }
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const getTypeName = (workingType) => {
  if (!workingType) return workingType
  const obj = tsTypeOptions.find(i => {
    return i.value === workingType
  })
  if (obj) {
    return obj.label
  }
  return workingType
}
</script>
<style lang="less" scoped>
  .content-card-wrap{
    min-height: 160px;
    margin: 6px;
    border-radius: 10px;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    padding: 5px 0;
    .content-card-item{
      display: flex;
      margin: 4px 0;
      padding: 6px 0;
      // min-height:32px;
      .iten-name{
        color: #818D99;
        text-align: right;
        width: 100px;
        flex-shrink: 0;
        box-sizing: border-box;
        padding-right: 20px;
        .red-style{
          color: #FF5733;
        }
      }
      .iten-content{
        color:#1D252F;
        flex: 1;
        max-height: 90px;
        overflow-y: auto;
        padding-right:8px;
        box-sizing: border-box;
      }
    }
  }
</style>
