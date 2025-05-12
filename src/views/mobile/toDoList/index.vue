<template>
  <div class="nav">
    <NavBar title="项目管理" />
    <van-search
      v-model="data.filter"
      shape="round"
      placeholder="请输入"
      :disabled="searchDisabled"
      @update:model-value="search"
    />
    <van-tabs
      v-model:active="data.active"
      sticky
      title-active-color="#677cea"
      line-height="0"
      @click-tab="handleChange"
    >
      <div class="todo" v-show="data.obj.inviteIsRedDot || data.obj.dbmWorkFlowIsRedDot" />
      <div class="toread" v-show="data.obj.noReadIsRedDot" />
      <van-tab v-for="tab in getTitleTabList" :key="tab.name" :title="tab.title" :name="tab.name" />
      
      <!-- 待办显示系统 -->
      <div v-if="data.active === 'todo' && (data.obj.inviteIsRedDot || data.obj.dbmWorkFlowIsRedDot)" class="tab-sys">
        <div v-for="sysTab in data.sysTabList" :key="sysTab.name">
          <div
            v-show="todoIsShowRed(sysTab.name)"
            :class="['sys-tab', data.sysActive === sysTab.name ? 'sys-tab-active' : '', todoIsShowRed(sysTab.name) ? 'sys-tab-red' : '']"
            @click="sysTabChange(sysTab.name)"
          >
            <span class="sys-tab-name">{{ sysTab.title }}</span> 
            <span class="red-round"></span>
          </div>
        </div>
      </div>

      <van-pull-refresh v-model="data.refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="data.loading"
          :finished="data.finished"
          finished-text="没有更多了"
          :immediate-check="false"
          @load="onLoad"
        >
          <div v-if="data.sysActive !== 'todoSQL'">
            <div
              v-for="item in getReviewList"
              :key="item"
              :class="['todo-tab-box', data.active === 'todo' ? 'todo-tab-content' : '']"
              @click="goToDetails(item)"
            >
              <h3 class="title">{{ item.name }}</h3>
              <p class="text">{{ item.projectName }}</p>
              <div class="flex">
                <div>
                  <span
                    v-show="data.active == 'todo' || data.active == 'done'"
                    class="tag"
                  >
                    <van-tag
                      :color="
                        item.statusName === '已结束'
                          ? '#eff6e2'
                          : item.statusName === '已作废' ||
                            item.statusName === '审批中'
                          ? '#f1f2f9'
                          : '#ffddd6'
                      "
                      :text-color="
                        item.statusName === '已结束'
                          ? '#79A133'
                          : item.statusName === '已作废' ||
                            item.statusName === '审批中'
                          ? '#455467'
                          : '#FF5733'
                      "
                      >{{ item.statusName }}</van-tag
                    >
                  </span>
                  <span class="time" v-if="data.active != 'todo'">{{
                    data.active == 'done' || data.active == 'read'
                      ? '处理时间:' +
                        (item.statusName === '已作废'
                          ? time(item.updateTime)
                          : time(item.handleTime))
                      : '知会时间:' + time(item.informTime)
                  }}</span>
                </div>
                <div class="name-box">
                  <span class="logo">{{
                    item.createName && item.createName.slice(-2)
                  }}</span>
                  <span class="text">{{ item.createName }}</span>
                </div>
              </div>
            </div>
          </div>
          <sql-card-list
            v-if="data.sysActive === 'todoSQL'"
            :dbmList="getReviewList"
            @goToDetails="goToDetails($event, 'todoSQL')"
          ></sql-card-list>
        </van-list>
      </van-pull-refresh>
    </van-tabs>
    
    <tab-bar :active="data.tabActive"></tab-bar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import NavBar from '@/components/NavBar'
import tabBar from '@/components/tabBar'
import Nothing from '@/components/Nothing'
import {
  getReviewTodoList,
  getReviewDoneList,
  getIsRedDot,
  getPageReviewRead
} from '@/common/api/user'
import { dayjs } from 'element-plus'
import { dbmList } from './mock.js'
import { showSuccessToast, showFailToast } from "vant";
import sqlCardList from './components/sqlCardList.vue'

const store = useStore()
const router = useRouter()
const data = reactive({
  tabsMap: [
    {
      title: '待办', // 待办--项目管理系统
      name: 'todo',
      list: []
    },
    {
      title: '待办', // 待办--SQL审核系统--tab不显示
      name: 'todoSQL',
      hide: true,
      list: []
    },
    {
      title: '已办',
      name: 'done',
      list: []
    },
    {
      title: '待阅',
      name: 'toRead',
      list: []
    },
    {
      title: '已阅',
      name: 'read',
      list: []
    },
  ],
  sysTabList: [
    {
      title: '项目管理系统',
      name: 'todo'
    },
    {
      title: 'SQL审核系统',
      name: 'todoSQL'
    },
  ],
  active: store.state.user.active,
  sysActive: store.state.user.sysActive,
  pageNum: 1,
  pageSize: 10,
  filter: '',
  loading: false,
  finished: false,
  refreshing: false,
  obj: {},
  timer: null,
  tabActive: 0
})

onMounted(() => {
  getRedDot()
})

// 获取红点数据--待办需要根据红点判断，高亮请求对应数据
const getRedDot = () => {
  data.loading = true
  data.obj.inviteIsRedDot = false
  data.obj.dbmWorkFlowIsRedDot = false
  getIsRedDot().then((res) => {
    data.obj = res.data
    if (data.active === 'todo') {
      if (data.obj.inviteIsRedDot) {
        // 有项目管理系统，请求对应数据
        sysTabChange('todo')
      } else if (data.obj.dbmWorkFlowIsRedDot) {
        // 有SQL审核系统，请求对应数据
        sysTabChange('todoSQL')
      } else {
        // 如果没有系统的话，下拉刷新调用红点接口，再根据红点状态请求对应数据
        data.finished = true
        data.loading = false
        data.refreshing = false
        data.sysActive = ''
        store.commit('SET_SYS_ACTIVE', '')
      }
    } else {
      onLoad()
    }
  }).catch((err) => {
    data.finished = true
    data.loading = false
    data.refreshing = false
    data.sysActive = ''
    store.commit('SET_SYS_ACTIVE', '')
    showFailToast("获取数据失败!");
  })
}

// 过滤tabs
const getTitleTabList = computed(() => {
  return data.tabsMap.filter(_ => !_.hide)
})
// 获取当前列表
const getReviewList = computed(() => {
  let tabName = ''
  if (data.active == 'todo') {
    if (data.sysActive === 'todo') {
      tabName = 'todo'
    } else if (data.sysActive === 'todoSQL') {
      tabName = 'todoSQL'
    }
  } else {
    tabName = data.active
  }
  let curObj = data.tabsMap.find(_ => _.name === tabName) || {}
  return curObj.list || []
})
const todoIsShowRed = computed(() => {
  return (name) => {
    if (name === 'todo') {
      return data.obj.inviteIsRedDot
    } else if (name === 'todoSQL') {
      return data.obj.dbmWorkFlowIsRedDot
    }
  }
})
const searchDisabled = computed(() => {
  return data.active === 'todo' && !data.sysActive
})

// 重置数据
const initData = () => {
  initList()
  data.pageNum = 1
  data.filter = ''
  data.loading = true
  data.refreshing = false
  data.finished = false
  data.sysActive = ''
  store.commit('SET_SYS_ACTIVE', '')
  store.commit('SET_ACTIVE', '')
}
// 清空列表
const initList = () => {
  for (let item of data.tabsMap) {
    item.list = []
  }
}
// 切换类型Tab
const handleChange = (val) => {
  console.log(data.active)
  initData()
  store.commit('SET_ACTIVE', data.active)
  if (data.active === 'todo') {
    getRedDot()
  } else {
    data.sysActive = ''
    store.commit('SET_SYS_ACTIVE', '')
    onLoad()
  }
}
// 切换系统Tab
const sysTabChange = (tab) => {
  initData()
  data.sysActive = tab
  store.commit('SET_SYS_ACTIVE', tab)
  if (tab === 'todo') {
    // 项目管理系统--待办
    reviewTodoList()
  } else if (tab === 'todoSQL') {
    // SQL审核系统--待办
    reviewTodoSqlList()
  }
}
// 获取项目管理系统待办列表--（去重是为了避免快速点击重复）
const reviewTodoList = () => {
  const parms = {
    pageNum: data.pageNum,
    pageSize: data.pageSize,
    filter: data.filter,
    reviewTicketType: 'tpcc'
  }
  data.loading = true
  data.finished = false
  // const _active = data.active
  getReviewTodoList(parms)
    .then((res) => {
      if (res.code === 200) {
        let curObj = data.tabsMap.find(_ => _.name === 'todo')
        let result = (res.data && res.data.appReviewInfoPage) || {}
        let pageList = result.data || []
        curObj.list =
          data.pageNum === 1
            ? pageList
            : curObj.list.concat(pageList)
        const map = new Map()
        for (const item of curObj.list) {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        }
        curObj.list = [...map.values()]
        if (data.active === 'todo' && data.sysActive === 'todo') {
          data.loading = false
          // data.finished = curObj.list.length >= result.totalCount
          data.finished = data.pageNum >= result.totalPage
          data.refreshing = false
          data.pageNum++
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
// 获取SQL审核系统待办列表--（去重是为了避免快速点击重复）
const reviewTodoSqlList = () => {
  const parms = {
    filter: data.filter,
    reviewTicketType: 'dbm',
  }
  data.loading = true
  data.finished = false
  getReviewTodoList(parms)
    .then((res) => {
      if (res.code === 200) {
        let curObj = data.tabsMap.find(_ => _.name === 'todoSQL')
        let pageList = (res.data && res.data.workflows) || []
        curObj.list = pageList
        // 下面注释需删除用来测试
        // curObj.list = dbmList().data.workflows
        const map = new Map()
        for (const item of curObj.list) {
          if (!map.has(item.workflowId)) {
            map.set(item.workflowId, item)
          }
        }
        curObj.list = [...map.values()]
        curObj.list = [...map.values()]
        data.loading = false
        data.finished = true
        data.refreshing = false
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 获取已办列表--（去重是为了避免快速点击重复）
const reviewDoneList = () => {
  const parms = {
    pageNum: data.pageNum,
    pageSize: data.pageSize,
    filter: data.filter
  }
  data.loading = true
  data.finished = false
  // const _active = data.active
  getReviewDoneList(parms)
    .then((res) => {
      if (res.code === 200) {
        let curObj = data.tabsMap.find(_ => _.name === 'done')
        let pageList = (res.data && res.data.data) || []
        curObj.list =
          data.pageNum === 1
            ? pageList
            : curObj.list.concat(pageList)
        const map = new Map()
        for (const item of curObj.list) {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        }
        curObj.list = [...map.values()]
        console.log('已办：active-->', data.active, 'type-->', 'done');
        if (data.active === 'done') {
          // data.finished = curObj.list.length >= res.data.totalCount
          data.finished = data.pageNum >= res.data.totalPage
          data.loading = false
          data.refreshing = false
          data.pageNum++
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 获取待阅已阅列表--（去重是为了避免快速点击重复）
const pageReviewRead = (type) => {
  const parms = {
    pageNum: data.pageNum,
    pageSize: data.pageSize,
    reviewName: data.filter,
    isRead: data.active == 'toRead' ? 0 : 1,
    tabType: data.active == 'toRead' ? 3 : 4
  }
  data.loading = true
  data.finished = false
  // const _active = data.active
  getPageReviewRead(parms)
    .then((res) => {
      if (res.code === 200) {
        let curObj = data.tabsMap.find(_ => _.name === type)
        let pageList = (res.data && res.data.data) || []
        curObj.list =
          data.pageNum === 1
            ? pageList
            : curObj.list.concat(pageList)
        const map = new Map()
        for (const item of curObj.list) {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        }
        curObj.list = [...map.values()]
        console.log('已阅：active-->', data.active, 'type-->', type);
        if (data.active === type) {
          // data.finished = curObj.list.length >= res.data.totalCount
          data.finished = data.pageNum >= res.data.totalPage
          data.loading = false
          data.refreshing = false
          data.pageNum++
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 去详情页面
const goToDetails = (item, type) => {
  console.log('item, type', item, type);
  if (type === 'todoSQL') {
    router.push({
      path: '/sqlPage',
      query: {
        workflowId: item.workflowId,
        workflowType: item.workflowType
      }
    })
  } else {
    router.push({
      path: '/details',
      query: {
        id: item.id,
        name: item.name,
        type: data.active,
        reviewInformId: item.reviewInformId ? item.reviewInformId : undefined
      }
    })
  }
}

const loadData = () => {
  if (data.active == 'todo') {
    if (data.sysActive === 'todo') {
      reviewTodoList()
    } else if (data.sysActive === 'todoSQL') {
      reviewTodoSqlList()
    } else {
      // 无系统待办---这里特殊要求，无系统的话，刷新获取红点，根据待办的红点请求对应待办系统的列表
      getRedDot()
    }
  } else if (data.active == 'done') {
    reviewDoneList()
  } else if (data.active == 'toRead') {
    pageReviewRead('toRead')
  } else if (data.active == 'read') {
    pageReviewRead('read')
  }
}

// 下拉刷新
const onRefresh = () => {
  data.pageNum = 1
  loadData()
}
// 上拉加载
const onLoad = () => {
  loadData()
}
// 搜索
const search = (val) => {
  data.pageNum = 1
  data.filter = val
  if (data.timer !== null) clearTimeout(data.timer)
  data.timer = setTimeout(() => {
    loadData()
  }, 500)
}
// 时间转换
const time = (time) => {
  if (time) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  } else {
    return '--'
  }
}
</script>

<style lang="less" scoped>
.nav {
  width: 100%;
  padding-bottom: 50px;
  :deep(.van-field__control) {
    margin-right: 30px;
  }
  :deep(.van-search__field) {
    padding: 0;
    background-color: transparent;
  }
  .van-tabs {
    position: relative;
    :deep(.van-tab__text) {
      font-size: 16px;
    }
    .todo {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: rgb(255, 87, 51);
      position: absolute;
      left: 64px;
      top: 10px;
    }
    .toread {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: rgb(255, 87, 51);
      position: absolute;
      left: 254px;
      top: 10px;
    }
    .tab-sys {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      background-color: #FFFFFF;
      // margin: 3px 0 7px 0;
      .sys-tab {
        font-size: 16px;
        height: 28px;
        line-height: 27px;
        padding: 0 16px 0 7px;
        color: #818D99;
        border-radius: 25px;
        border: 1px solid #818D99;
        margin-right: 10px;
        position: relative;
        // padding-right: 7px;
        padding-right: 16px;
        .sys-tab-name {
          font-size: 16px;
        }
        .red-round {
          position: absolute;
          top: 4px;
          right: 6px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #818D99;
        }
        &.sys-tab-red {
          padding-right: 16px;
        }
        &.sys-tab-active {
          color: #526AE7;
          border-color: #526AE7;
          .red-round {
            background: rgb(255, 87, 51);
          }
        }
      }

    }
  }
  /deep/ .todo-tab-box {
    padding: 14px 16px;
    background-color: #fff;
    border-radius: 10px;
    margin: 12px 0 4px 0;
    &.todo-tab-content {
      // margin: 0 0 4px 0;
    }
    .title {
      font-size: 16px;
      line-height: 16px;
      margin-bottom: 10px;
      color: rgb(29, 37, 47);
      font-weight: 600;
    }
    .text {
      font-size: 12px;
      line-height: 12px;
      color: rgb(69, 84, 103);
    }
    .flex {
      display: flex;
      height: 30px;
      justify-content: space-between;
      align-items: center;
      .tag {
        margin-right: 5px;
      }
      .time {
        font-size: 12px;
        color: rgb(129, 141, 153);
        padding: 2px 5px;
        background-color: rgb(241, 242, 249);
      }
      .name-box {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo {
        width: 30px;
        height: 30px;
        line-height: 30px;
        display: inline-block;
        border-radius: 50%;
        background-color: #e5e9fc;
        color: rgb(82, 106, 231);
        margin-right: 4px;
        text-align: center;
        font-size: 10px;
      }
      .text {
        display: inline-block;
        min-width: 70px;
        max-width: 150px;
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        white-space: nowrap;      /* 文本不换行 */
        overflow: hidden;         /* 隐藏超出容器的内容 */
        text-overflow: ellipsis;  /* 使用省略号表示被截断的文本 */
      }
    }
  }
}
</style>
