<template>
  <Loading :visible="true" v-if="tsheetsLoading" />
  <van-list
    v-else
    class="tsheets-main"
    :finished="!tsheetsLoading"
    finished-text="没有更多内容了"
    ref="scrollable"
    id="approval"
  >
    <NavTop title="工时审批" :rightBtn="false">
      <van-sticky :offset-top="0" @change="stickChange">
        <div class="nav-top-main" :class="{'fixed-top-style':isFixedTop}">
          <div class="nav-top-title">
            工时周期 {{ workInfo.cycleStart }}～{{ workInfo.cycleEnd }}
          </div>
        </div>
      </van-sticky>
    </NavTop>
    <div class="tsheets-conent">
      <Collapse default-open title="各系统工时明细（单位：天）">
        <approvalInfoTable ref="ref_approvalInfoTable"/>
      </Collapse>

      <Collapse class="user-info-collapse" default-open title="各员工工时明细">
        <userInfoList ref="ref_userInfoList" :tsheetsId="router.currentRoute.value.query.id" />
      </Collapse>
    </div>
  </van-list>

  <van-tabbar
    safe-area-inset-bottom
    v-if="!tsheetsLoading"
  >
    <div class="bom-main">
      <van-button type="default" size="small" @click="handleCancel">取消</van-button>
      <van-button color="#526AE7" size="small" v-if="workInfo.status !== 2 && !tsheetsLoading" :loading="submitLoading" @click="submit()">提交</van-button>
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
import { Loading, NavTop, Collapse } from '@/components/index'

import { getWorkingApprovalDetails, confirmWorking } from '@/common/api/TSheets'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import { exitApp } from '@/common/utils/comm'
import approvalInfoTable from './components/approvalInfoTable'
import userInfoList from './components/userInfoList'
const { proxy } = getCurrentInstance()

onMounted(() => {
  getInfo()
})
const router = useRouter()
const tsheetsLoading = ref(false) // 页面loading
const workInfo = ref({}) // 工时详情
const isSubmit = ref(true)
const day = ref(0) // 已填公式
const ref_tsheetsCards = ref()
// 提交按钮loading
const submitLoading = ref(false)
const ref_approvalInfoTable = ref()
const ref_userInfoList = ref()

// 获取评审详情
const getInfo = () => {
  if (!router.currentRoute.value.query.id) {
    showFailToast('url地址有误')
    setTimeout(() => {
      exitApp()
    }, 3000)
    return
  }
  tsheetsLoading.value = true
  getWorkingApprovalDetails({
    id: router.currentRoute.value.query.id
  })
    .then((res) => {
      tsheetsLoading.value = false
      if (res.code === 200) {
        workInfo.value = res.data
        let userWorkingList = res.data?.userWorkingList || []
        isSubmit.value = userWorkingList.every(i => {
          return i.status === 1
        })
        nextTick(() => {
          ref_approvalInfoTable.value.completedSysInfo(res.data?.sysWorkingList || [])
          ref_userInfoList.value.init(userWorkingList)
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

const trackBtnClick = (fieldName) => {
  proxy.$trackWay.trackCustomEv('mobile_work_hour_approve_page_click', { approve_page_btn_name: fieldName })
}

const handleCancel = () => {
  trackBtnClick('取消')
  exitApp()
}

// 提交
const submit = async (detailsList) => {
  trackBtnClick('提交')
  let noPass = false
  if (!isSubmit.value) {
    // 应填工时与已填工时不一致
    const errUserArr = []
    workInfo.value.userWorkingList.map(i => {
      if (i.status === 2) {
        errUserArr.push(i.realName)
      }
      return false
    })
    let message = `${errUserArr.join('，')} 的已填工时与应填工时不一致，审批后无法修改，是否继续审批?`
    noPass = await showConfirmDialog({
      title: '提醒',
      message
    })
      .then(() => {
        return false
      })
      .catch(() => {
        return true
      })
  } else {
    // 应填工时与已填工时一致
    noPass = await showConfirmDialog({
      title: '提醒',
      message: '审批后员工工时将无法修改，是否继续审批?'
    })
      .then(() => {
        return false
      })
      .catch(() => {
        return true
      })
  }
  if (noPass) return false
  
  submitLoading.value = true
  confirmWorking(
    {
      id: Number(router.currentRoute.value.query.id),
      ldap: getLdap()
    }
  ).then((res) => {
    submitLoading.value = false
    if (res.code === 200) {
      showSuccessToast('提交成功!')
      setTimeout(() => {
        exitApp()
      }, 3000)
    } else {
      showFailToast(res.message)
    }
  })
    .catch((err) => {
      showFailToast(err.message || '网络错误请稍后重试！')
      submitLoading.value = false
    })
}
// 获取Ldap
const getLdap = () => {
  let authData = localStorage.getItem('authData') || '{}'
  authData = JSON.parse(authData)
  return authData?.userId
}

// 是否吸顶
const isFixedTop = ref(false)
const stickChange = (res) => {
  isFixedTop.value = res
}
const content = ref()
const scrollToBottom = () => {
  const tsheets = document.getElementById('tsheets')
  const t1 = setInterval(() => {
    tsheets.scrollTop = tsheets.scrollTop + 200
    if (tsheets.scrollTop >= tsheets.scrollHeight - tsheets.clientHeight) {
      tsheets.scrollTop = tsheets.scrollHeight
      clearInterval(t1)
    }
  }, 100)
}
</script>
<style lang="less" scoped>
.tsheets-main {
  font-size: 12px;
  margin: 0 auto;
  padding-bottom: 60px;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  .nav-top-main {
    padding: 0 16px;
    padding-top: 36px;
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
.user-info-collapse{
  margin-top: 16px;
  padding: 0px 0px;
  /deep/.collapse-header{
    padding: 0px 16px;
  }

  /deep/.collapse-main{
    background-color: #F1F2F9;
    padding-top: 0px;
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
