<template>
  <Loading :visible="true" v-if="tsheetsLoading" />
  <van-list
    v-else
    class="tsheets-main"
    :finished="!tsheetsLoading"
    finished-text="没有更多内容了"
    ref="scrollable"
    id="tsheets"
  >
    <NavTop title="工时登记" :rightBtn="false">
      <van-sticky :offset-top="0" @change="stickChange">
        <div class="nav-top-main" :class="{'fixed-top-style':isFixedTop}">
          <div class="nav-top-title">
            登记周期 {{ workInfo.cycleStart }}～{{ workInfo.cycleEnd }}
          </div>
          <div class="flex-bar">
            <div>
              应填工时<b>{{ workInfo.filledHours }}</b
              >天
            </div>
            <div>
              已填工时<b>{{ day }}</b
              >天
            </div>
          </div>
        </div>
      </van-sticky>
    </NavTop>
    <div class="tsheets-conent">
      <tsheetsCards ref="ref_tsheetsCards" v-model:day="day" :workInfo="workInfo" :filledHours="workInfo.filledHours" @submit="submit"  :disabled="workInfo.pageType === 2" @scrollToBottom="scrollToBottom" />
    </div>
  </van-list>

  <van-tabbar
    safe-area-inset-bottom
    v-if="!tsheetsLoading"
  >
    <div class="bom-main">
      <van-button type="default" size="small" @click="exitApp">取消</van-button>
      <van-button color="#526AE7" size="small" v-if="workInfo.isEdit === 1 && !tsheetsLoading && workInfo.filledHours !== 0" :loading="submitLoading" @click="submit()">{{workInfo.status === 2 ?'提交':'修订'}}</van-button>
    </div>
  </van-tabbar>

</template>
<script setup>
import {
  ref,
  nextTick,
  reactive,
  onMounted,
  getCurrentInstance,
  computed
} from 'vue'
import { useRouter } from 'vue-router'
import { Loading, NavTop } from '@/components/index'
import tsheetsCards from './components/tsheetsCards'
import { queryWorkingHours, editWorkingHours } from '@/common/api/TSheets'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import { exitApp, removeNull } from '@/common/utils/comm'
import { cloneDeep } from 'lodash'

onMounted(() => {
  getQueryWorkingHours()
  // Toast('messagesss')
})
const router = useRouter()
const tsheetsLoading = ref(false) // 页面loading
const workInfo = ref({}) // 工时详情
const day = ref(0) // 已填公式
const ref_tsheetsCards = ref()
// 提交按钮loading
const submitLoading = ref(false)

// 获取工时详情
const getQueryWorkingHours = (type = 1) => {
  if (!router.currentRoute.value.query.id) {
    showFailToast('url地址有误')
    setTimeout(() => {
      exitApp()
    }, 3000)
    return
  }
  tsheetsLoading.value = true
  queryWorkingHours({
    id: router.currentRoute.value.query.id,
    type // 类型：1-当前周期 2-上一个周期
  })
    .then((res) => {
      tsheetsLoading.value = false
      if (res.code === 200) {
        if (type === 1) {
          if (res.data === null) {
            showFailToast('当前链接有误！')
            setTimeout(() => {
              exitApp()
            }, 3000)
            return
          }
          console.log('res.data:', res.data)
          workInfo.value = res.data
        } else {
          workInfo.value.detailsList = res?.data?.detailsList || []

          showDialog({
            message: '已为您自动带出上周登记的数据，请您根据本周工作修订后提交。'
          })
        }

        nextTick(() => {
          if (res?.data?.status === 2 && type === 1 && res.data.filledHours !== 0) {
            getQueryWorkingHours(2)
          } else {
            ref_tsheetsCards.value.init(res?.data?.detailsList || [])
          }
        })
      } else {
        showFailToast(res.message)
        setTimeout(() => {
          exitApp()
        }, 3000)
      }
    })
    .catch((err) => {
      showFailToast(err.message || '网络错误请稍后重试！')
      tsheetsLoading.value = false
      setTimeout(() => {
        exitApp()
      }, 3000)
    })
}

// 提交
const submit = (detailsList) => {
  if (!detailsList) {
    ref_tsheetsCards.value.checkoutAll()
    return
  }
  const deepDetailsList = detailsList.map(i => {
    return removeNull(i)
  })
  submitLoading.value = true
  const data = {
    id: Number(router.currentRoute.value.query.id),
    detailsList: deepDetailsList
  }
  editWorkingHours(data)
    .then((res) => {
      submitLoading.value = false
      if (res.code === 200) {
        showSuccessToast('操作成功')
        setTimeout(() => {
          exitApp()
        }, 3000)
      } else {
        showFailToast(res.message)
      }
    })
    .catch((err) => {
      submitLoading.value = false
      showFailToast(err.message || '网络错误请稍后重试！')
    })
}

// 是否吸顶
const isFixedTop = ref(false)
const stickChange = (res) => {
  isFixedTop.value = res
}
const content = ref()
const t1 = ref(null)
const scrollToBottom = () => {
  const tsheets = document.getElementById('tsheets')
  t1.value = setInterval(() => {
    tsheets.scrollTop = tsheets.scrollTop + 375
    if (tsheets.scrollTop >= (tsheets.scrollHeight - tsheets.clientHeight)) {
      tsheets.scrollTop = tsheets.scrollHeight
      clearInterval(t1.value)
      clearInterval(t1.value)
    }
  }, 100)
  // 多重清除定时器
  setTimeout(() => {
    clearInterval(t1.value)
  }, 3000)
}
</script>
<style lang="less" scoped>
.tsheets-main {
  font-size: 12px;
  margin: 0 auto;
  padding-bottom: 60px;
  height: 100vh;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  height: calc(100vh - constant(safe-area-inset-top) - constant(safe-area-inset-bottom));
  overflow-y: auto;
  box-sizing: border-box;
  .nav-top-main {
    padding: 0 16px;
    padding-top: 16px;
    .nav-top-title {
      font-size: 16px;
      font-weight: bold;
      color: #1d252f;
    }
    .flex-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      margin-top: 4px;
      b {
        color: #ff5733;
        font-weight: bold;
        padding: 0 2px;
      }
    }
  }
  .tsheets-conent {
    margin-top: -10px;
  }
}
.bom-main {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  > button {
    width: 110px;
    margin: 0 14px;
  }
}
// 皮毛玻璃效果
.fixed-top-style{
    position: relative;
    border-bottom: 1px solid #dcdfe6;
    background-image: radial-gradient(transparent 1px,#ffffff 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(50%) blur(4px);
    top: 0;
    padding:0px 10px 10px 10px !important;
    border-top: 10px solid rgba(0, 0, 0, 0);
    padding-top: constant(safe-area-inset-top) !important; /* 兼容 Safari */
    padding-top: env(safe-area-inset-top) !important; /* 兼容其他浏览器 */
}
</style>
