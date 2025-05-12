<template>
<van-collapse v-model="ldap" accordion class="collapse-wrap"  @change="handDetails">
  <van-collapse-item v-for="i in userList" :key="i.ldap" :name="i.ldap">
    <template #title>
      <div class="collapse-title">
        <img :src="require('@/assets/images/tsheets-user.svg')" alt="" />
        <span>{{ i.realName }}</span>
      </div>
    </template>
    <template #value>
      <div class="collapse-value">
        <div class="collapse-value-title">登记情况：</div>
        <div class="status-ball ball-success" v-if="i.status === 1"></div>
        <div class="status-ball ball-error" v-if="i.status === 2"></div>
        <!-- <div class="status-ball ball-success" v-if="i.status === 1">已完成</div>
        <div class="status-ball ball-error" v-if="i.status === 2">未完成</div> -->
      </div>
    </template>
    <template #default>
      <div class="item-wrap" v-loading="itemLoading">
        <div class="date-list">
          <div class="date-item" :class="{ active: activeDataIndex === index }" v-for="(s,index) in i.userCycleList" :key="s.cycleStart" @click="handDate(index)">
            <span>{{ setDate(s) }}</span>
            <img class="ststus-img" v-if="s.status === 1" :src="require('@/assets/images/tssheets-ball-success.svg')" alt="" srcset=""/>
            <img  class="ststus-img"  v-if="s.status === 2" :src="require('@/assets/images/tssheets-ball-error.svg')" alt="" srcset=""/>
          </div>
        </div>
        <div class="card-item" :class="(i?.userCycleList[activeDataIndex]?.filledHours == 0 && i?.userCycleList[activeDataIndex]?.haveFilledHours == 0) ? 'no-input':''">
          <tsheetsContentCard v-if="ldap === i.ldap"  :loading="contentLoading" :tsheetsList="i.userCycleList[activeDataIndex]?.detailsList"/>
        </div>
      </div>
    </template>
  </van-collapse-item>
</van-collapse>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import { showFailToast } from 'vant'
import { cloneDeep } from 'lodash'
import { getUserWorkingDetails } from '@/common/api/TSheets'
import tsheetsContentCard from './tsheetsContentCard'
import { dayjs } from 'element-plus'

const props = defineProps({
  tsheetsId: {
    type: String,
    required: true
  }
  // list: {
  //   type: Array,
  //   default: () => {
  //     return []
  //   }
  // }
})
// 当前展开ldap
const ldap = ref()
// 数据列表
const userList = ref([])
const itemLoading = ref(false)
const activeDataIndex = ref(0)
// 初始化
const init = (list) => {
  const backList = cloneDeep(list || [])
  backList.forEach(i => {
    i.userCycleList = []
  })
  userList.value = backList
  console.log('userList', userList)
  // 默认展开第一个
  // ldap.value = list[0].ldap
  // handDetails(list[0].ldap)
}
// 点击手风琴
const handDetails = (ldap) => {
  if (!ldap) return false
  itemLoading.value = true
  activeDataIndex.value = 0
  getUserWorkingDetails({
    id: props.tsheetsId,
    ldap
  }).then((res) => {
    itemLoading.value = false
    if (res.code === 200) {
      setValue(res.data?.userCycleList)
    } else {
      showFailToast(res.message)
    }
  })
    .catch((err) => {
      showFailToast(err.message || '网络错误请稍后重试！')
      itemLoading.value = false
    })
}
//
const setValue = (userCycleList) => {
  const obj = userList.value.find(i => {
    return i.ldap === ldap.value
  })
  if (obj) {
    obj.userCycleList = userCycleList
  }
}
// 设置时间格式
const setDate = (s) => {
  let str = ''
  str += dayjs(s.cycleStart).format('MM-DD')
  str += ' 至 '
  str += dayjs(s.cycleEnd).format('MM-DD')
  return str
}
const contentLoading = ref(false)
const handDate = (index) => {
  activeDataIndex.value = index
  contentLoading.value = true
  setTimeout(() => {
    contentLoading.value = false
  }, 300)
}
defineExpose({ init })
</script>
<style lang="less" scoped>
.collapse-wrap{
  /deep/.van-collapse-item{
    background-color: #ffffff;
    .van-collapse-item__content{
      padding-left: 0px;
      padding-right: 0px;
      padding-top: 0px;
      background-color: #f1f2f9;
    }
  }
  .collapse-title{
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #1D252F;
    font-weight: 500;
    >img{
      display: block;
      width: 14px;
      height: 14px;
      margin-right: 6px;
    }
  }
  /deep/.van-cell__value{
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .collapse-value{
    display: flex;
    align-items: center;
    >.collapse-value-title{
      font-size: 12px;
      color: #44566C;
      display: flex;
      align-items: center;
    }
    >.status-ball{
      font-size: 14px;
      color: #1D252F;
      padding-left: 14px;
      // margin-left: 10px;
      position: relative;
      display: flex;
      align-items: center;
      padding-right: 10px;
      &::after{
        content: ' ';
        position: absolute;
        top: 50%;
        left: 0px;
        width: 8px;
        height: 8px;
        margin-top:-4px;
        border-radius: 100%;
      }
      &.ball-success{
        &::after{
          background: #7DA626;
          box-shadow: 0px 2px 4px  #7DA626;
        }
      }
      &.ball-error{
        &::after{
          box-shadow: 0px 2px 4px  #FF8D1A;
          background: #F05F5F;
        }
      }
    }
  }
}

// /deep/.van-collapse-item__wrapper{
//   background-color: #F1F2F9;
//   width: 100%;
//   padding: -16px;
// }
.item-wrap{
  min-height: 140px;
  background-color: #F1F2F9;
  // width: 100%;
  // padding: -16px;
  // margin: -16px;
  // position: relative;
  // z-index: 30;
  /deep/.el-loading-mask{
    display: flex;
    align-items: center;
    .el-loading-spinner{
      position:static;
    }

  }
}

.date-list{
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-wrap: nowrap;
  box-sizing: border-box;
  padding: 4px 0px;
  border: 4px solid #F1F2F9;
  .date-item{
    flex-shrink: 0;
    border-radius: 5px;
    background: #E2E5EB;
    border: 1px solid #DDE2EB;
    font-size: 12px;
    color: #1D252F;
    margin-right: 4px;
    height: 28px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding:0 4px;
    &:nth-last-child(1){
      margin-right: 0px;
    }
    &.active{
      background-color: #ffffff;
      color: #526AE7;
      border-color: #ffffff
    }
    >img{
      width: 12px;
      height: 12px;
      margin-left: 6px;
      display: block;
    }
  }
}

</style>
