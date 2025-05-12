<template>
  <div class="info-table-wrap">
    <div class="tag-wrap">
      <div>总: <b>{{total.all}}</b></div>
      <div>研发: <b>{{total.develop}}</b></div>
      <div>运维: <b>{{ total.operation }}</b></div>
      <div>综合管理: <b>{{ total.management}}</b></div>
    </div>
    <el-table class="collapse-table" :data="sysTableData" stripe size="small">
      <el-table-column label="工时类型" prop="type" fixed="left"></el-table-column>
      <el-table-column :label="i.label" :prop="i.prop"  v-for="(i,index) in headArr" :key="index">
      <template #header >
        <div class="required-title" v-text="i.label" :title="i.label"></div>
      </template>
      </el-table-column>
      <!-- <el-table-column label="合计" prop="total" fixed="right">
        <template #header >
          <div class="font-b" >合计</div>
        </template>
        <template #default="{row}">
          <span class="font-b"> {{ computedTotal(row) }}</span>
        </template>
      </el-table-column> -->
    </el-table>
    <div class="tips-right">
      <div>
        滑动查看更多 <img :src="require('@/assets/images/icon/icon-right.png')" alt=""/>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ElTable, ElTableColumn } from 'element-plus'
import { cloneDeep } from 'lodash'
import { ref, reactive } from 'vue'
import NP from 'number-precision'
const ysyData = [
  {
    type: '研发'
  },
  {
    type: '运维'
  },
  {
    type: '综合管理'
  },
  {
    type: '总计'
  }
]
const headArr = ref([])
const sysTableData = ref([])
const total = reactive({
  all: null,
  develop: null,
  operation: null,
  management: null
})

const completedSysInfo = (sysWorkingList) => {
  const backSysTableData = cloneDeep(ysyData)
  // 研发、运维、管理、合计
  const aysArr = ['researchTime', 'operationTime', 'managementTime', 'total']
  const blackHeadArr = sysWorkingList.map((i, index) => {
    backSysTableData.forEach((s, sindex) => {
      s['sys' + index] = i[aysArr[sindex]]
    })
    return {
      prop: 'sys' + index,
      label: i.sysName
    }
  })
  headArr.value = blackHeadArr
  sysTableData.value = backSysTableData
  computedTotalItem(backSysTableData)
}
const computedTotalItem = (sysTableData) => {
  total.all = computedTotal(sysTableData[3])
  total.develop = computedTotal(sysTableData[0])
  total.operation = computedTotal(sysTableData[1])
  total.management = computedTotal(sysTableData[2])
}

const computedTotal = (row) => {
  let total = 0
  for (const i in row) {
    if (i !== 'type') {
      total = NP.plus(total, row[i])
    }
  }
  return total
}
defineExpose({ completedSysInfo })
</script>
<style lang="less" scoped>
.info-table-wrap {
  font-size: 12px;
  color: #1d252f;
  .info-statistics {
    display: flex;
    align-items: center;
    .info-statistics-item {
      position: relative;
      margin-right: 100px;
      padding-left: 16px;
      color: #44566c;
      > span {
        padding-left: 16px;
        color: #1d252f;
      }
      &::after {
        content: ' ';
        position: absolute;
        top: 50%;
        left: 0px;
        width: 8px;
        height: 8px;
        margin-top: -4px;
        border-radius: 100%;
      }
      &:nth-child(1) {
        &::after {
          background-color: #526ae7;
        }
      }
      &:nth-child(2) {
        &::after {
          background-color: #59cfc7;
        }
      }
      &:nth-child(3) {
        &::after {
          background-color: #bed984;
        }
      }
    }
  }

  .collapse-table {
    border-radius: 10px;
    overflow: hidden;
    table-layout: auto;
    font-size: 12px;
    color: #1d252f;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    width: 100%;
    /deep/.el-table__header-wrapper,
    /deep/.el-table__fixed-header-wrapper {
      .el-table__cell {
        background-color: #f7f8fc;
        border-bottom: none;
        // padding: 5px 0;
        .cell {
          font-size: 12px;
          font-weight: 700;
          color: #1d252f;
        }
      }
    }
    /deep/.el-table__cell{
      border-bottom: none
    }
    /deep/.el-table__inner-wrapper{
      &::before{
        background-color:rgba(0, 0, 0, 0)
      }
    }
  }
  .statistics-br{
    line-height: 1.3;
  }
  .statistics-br-empty{
    color: #8D9EAE;
  }
}
.required-title{
  display: -webkit-box;
  line-height: 1.2;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: 700;
}
/deep/.el-table__body{
  tbody>.el-table__row{
    &:nth-last-child(1){
      .cell{
        font-weight: 700;
      }
    }
  }
}
.font-b{
  font-weight: 700;
}
.tag-wrap{
  display: flex;
  align-items: center;
  font-size: 12px;
  position: relative;
  top: -8px;
  padding-left: 4px;
  >div{
    padding-right: 16px;
  }
}
.tips-right{
  display: flex;
  justify-content: flex-end;
  >div{
    display: flex;
    align-items: center;
    font-size: 12px;
    height: 20px;
    border-radius: 2px;
    padding: 0 4px;
    background: #e9eff3;
    overflow: hidden;
    position: relative;
    top: 6px;
    >img{
      width: 12px;
      height: 12px;
    }
  }
}

/deep/.el-table.is-scrolling-middle .el-table-fixed-column--left.is-last-column,/deep/.el-table.is-scrolling-right .el-table-fixed-column--left.is-last-column{
  box-shadow: 0px 6px 10px rgba(0,0,0,0.15);
  &:before{
    box-shadow:  none;
  }
}
</style>
