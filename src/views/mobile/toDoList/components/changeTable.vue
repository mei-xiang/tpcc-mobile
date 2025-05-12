<template>
    <div class="change-table-wrap">
      <div class="change-table-head">
        计划任务
      </div>
      <div class="chage-table-list" v-for="(i,index) in list" :key="index">
        <div class="list-title">
          {{ index + 1 }} {{ i.planName }}
          <!-- <span class="btn-tips btn-change" v-if="i.status === 1">变更</span> -->
          <span class="btn-tips btn-delete" v-if="i.status === 2">删除</span>
          <span class="btn-tips btn-add" v-else-if="i.status === 3">新增</span>
        </div>
        <div class="list-time">
          <div class="start-time">
            开始时间调整后：<span>{{ i.planStartTime || '--' }}</span>
          </div>
          <div class="end-time">
            调整前：<span>{{ i.previousStartTime || '--' }}</span>
          </div>
        </div>
        <div class="list-time">
          <div class="start-time">
            完成时间调整后：<span>{{ i.planEndTime || '--' }}</span>
          </div>
          <div class="end-time">
            调整前：<span>{{ i.previousEndTime || '--' }}</span>
          </div>
        </div>
      </div>
    </div>
</template>
<script setup>
import { reactive, ref, watch } from 'vue'
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  }
})

</script>

<style lang="less" scoped>
.change-table-wrap{
  border: 1px solid #EEF1F6;
  border-top: none;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 10px;
  .change-table-head{
    height: 30px;
    border-radius: 10px 10px 0px 0px;
    background-color: #EEF1F6;
    font-size: 12px;
    font-weight: 700;
    color: #1D252F;
    text-indent: 16px;
    line-height: 30px;
  }
  .list-title{
    font-size: 13px;
    color: #1D252F;
    font-weight: 700;
    display: flex;
    align-items: center;
    .btn-tips{
      width: 34px;
      height: 17px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 10px;
      font-weight: 400;
      overflow: hidden;
      border-radius: 4px;
      margin: 0 2px;
      &.btn-add{
        background: rgba(255, 87, 51, 0.09);
        color: rgba(240, 105, 105, 1);
      }
      &.btn-delete{
        background-color: rgba(128, 128, 128, 0.15);
        color: rgba(128, 128, 128, 1);
      }
      &.btn-change{
        background-color: #ecf5ff;
        color: #409eff;
      }
    }
  }
  .list-title,.list-time{
    height: 30px;
    line-height: 30px;
    border-top: 1px solid #EEF1F6;
    padding: 0 12px;
    box-sizing: border-box;
  }
  .list-time{
    display: flex;
    >.start-time{
      flex:3
    }
    >.end-time{
      flex:2
    }
  }

}
</style>
