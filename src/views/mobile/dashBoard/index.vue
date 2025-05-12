<template>
  <!-- Loading加载页 -->
  <!-- <Loading :visible="true" v-if="data.pageLoading" /> -->
  <Welcome
    :visible="true"
    v-if="data.pageLoading"
    :imageType="data.pageLoading"
  ></Welcome>

  <template v-else>
    <!-- 有权限查看 dataStatus: 1 -->
    <!-- v-if="data.dataStatus === 1" -->
    <div
      :class="[
        'dashBoard',
        {
          'pc-dashBoard': $isPCBrowser,
          // 'no-tabbar-dash-board': !data.showTabBar,
          'iphone-device': $isIphone,
        },
      ]"
      id="dashBoard"
    >
      <!-- 运维看板 -->
      <div class="fix-header">
        <!-- <van-sticky z-index="999"> -->
        <NavBar
          class="dashboard-nav-bar"
          slotRight
          :slotCenter="true"
          :slotLeft="true"
        >
          <!-- <template #nav-left>
            <span class="nav-bar-title">{{ "运维看板" }}</span>
          </template> -->
          <template #nav-center>
            <span class="nav-bar-title">{{ "运维看板" }}</span>
            <page-type-bar
              :pageType="data.pageType"
              :tabList="data.tabList"
              @handleBarClick="handleBarClick"
            ></page-type-bar>
            <span class="nav-bar-time">
              {{ formatDate(data.staticTime, "/") }}
            </span>
          </template>

          <template #nav-right>
            <el-dropdown
              placement="bottom-end"
              popper-class="popper-dashboard"
              :teleported="false"
              trigger="click"
              @command="handleCommand"
            >
              <van-image
                :width="$px2rem(24)"
                :height="$px2rem(24)"
                :src="data.argImg"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="command in getCommandList"
                    :command="command.value"
                    :key="command.value"
                  >
                    {{ command.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </NavBar>

        <!-- </van-sticky> -->
        <div class="quick-enter">
          <div class="tabs-box" ref="tabBoxRef">
            <span
              v-for="(sys, sysIdx) in data.quickSysList"
              :key="sysIdx"
              @click="sysClick(sys)"
            >
              {{ sys.sysName }}
            </span>
          </div>
          <sys-drop-down
            v-if="data.showMore"
            :checkOps="data.quickSysList"
            @sysClick="sysClick($event)"
          ></sys-drop-down>
        </div>
      </div>

      <userAnalysis
        id="userAnalysis"
        :staticTime="data.staticTime"
        :echartData="data.echartData"
      ></userAnalysis>
      <sysAnalysis
        id="sysAnalysis"
        :staticTime="data.staticTime"
        :echartData="data.echartData"
      ></sysAnalysis>
      <resourceEfficiency
        id="resourceEfficiency"
        :staticTime="data.staticTime"
        :echartData="data.echartData"
      ></resourceEfficiency>

      <div class="footer-box">
        <span>没有更多内容了</span>
      </div>
      <!-- <tab-bar v-if="data.showTabBar" :active="data.tabActive"></tab-bar> -->

      <template v-if="!$isPCBrowser">
        <van-floating-bubble
          axis="xy"
          magnetic=""
          :gap="data.gap"
          class="floating-box"
          @offset-change="onOffsetChange"
          @click="handleBackTop"
        >
          <img
            v-show="data.showBack"
            class="back-top"
            :src="require('@/assets/images/dashBoard/back-top.svg')"
            alt=""
          />
        </van-floating-bubble>
      </template>
    </div>

    <!-- 无权限查看 dataStatus: 2 -->
    <!-- <div v-else class="no-data-page">
      <van-image
        class="not-data-img"
        :width="$px2rem(178)"
        :height="$px2rem(150)"
        fit="cover"
        :src="data.notData"
      />
    </div> -->
  </template>
</template>

<script setup name="DashBoard">
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  watch,
  computed,
  nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import pageTypeBar from "./components/pageTypeBar";
import NavBar from "@/components/NavBar";
import tabBar from "@/components/tabBar";
import Welcome from "@/components/Welcome";
// import Loading from "@/components/Loading";
import userAnalysis from "./components/userAnalysis";
import sysAnalysis from "./components/sysAnalysis";
import resourceEfficiency from "./components/resourceEfficiency";
import sysDropDown from "./components/sysDropDown";
import { rem2px, exitApp, formatDate } from "@/common/utils/comm";
import { preData } from "@/views/mobile/dashBoard/utils.js";
import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showLoadingToast, closeToast } from "vant";

const route = useRoute();
const router = useRouter();
const store = useStore();
const { proxy } = getCurrentInstance();

const tabBoxRef = ref(null);

const data = reactive({
  staticTime: "", // 统计日期
  pageLoading: true, // 页面loading
  // showTabBar: false, // 是否显示tabBar
  pageTitle: "运维看板", // 看板标题
  dataStatus: null, // 1-有权限查看 2-无权限查看
  echartData: {}, // 图表数据

  pageType: 1,
  tabList: [
    {
      pageTitle: "用户分析",
      pageType: 1,
      id: "userAnalysis",
      offsetTop: 0,
    },
    {
      pageTitle: "系统分析",
      pageType: 2,
      id: "sysAnalysis",
      offsetTop: 0,
    },
    {
      pageTitle: "资源效率",
      pageType: 3,
      id: "resourceEfficiency",
      offsetTop: 0,
    },
  ],
  tabActive: 1, // 页签类型：1运维看板 0待办
  showBack: false,
  notData: require("@/assets/images/not-data.svg"),
  argImg: require("@/assets/images/dashBoard/arg.svg"),
  gap: rem2px(proxy.$px2rem(24)), // 24
  quickSysList: [],
  showMore: false,

  commandStatus: 1, // 1全部 2关注
  commandList: [
    {
      name: "查看全部系统",
      value: 1,
    },
    {
      name: "查看关注系统",
      value: 2,
    },
    {
      name: "重点系统趋势",
      value: 3,
    },
    {
      name: "退出",
      value: 4,
    },
  ],
});

// 获取快捷系统列表
const getQuickSysList = () => {
  getPublicBusiness({ businessType: "dictInfo" })
    .then((res) => {
      console.log("getQuickSysList", res);
      if (res.code === 200) {
        data.quickSysList = res.data || [];
        nextTick(() => {
          if (
            tabBoxRef.value &&
            tabBoxRef.value.scrollWidth > tabBoxRef.value.clientWidth
          ) {
            data.showMore = true;
          } else {
            data.showMore = false;
          }
        });
      } else {
        showFailToast(res.message || "接口异常");
      }
    })
    .catch((err) => {
      console.log("err", err);
    });
};

// 数据来源：从项目管理系统tab页进入
if (!route.query.dateTime) {
  preData()
}
const getCommandList = computed(() => {
  return data.commandList.filter((_) => _.value !== data.commandStatus);
});

const __scrollHandle = (e) => {
  let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  // console.log("scrollTop", scrollTop);
  if (scrollTop >= 200) {
    data.showBack = true;
  } else {
    data.showBack = false;
  }

  let headerDom = document.querySelector(".fix-header");
  let navBarDom = document.querySelector(".nav-bar");
  let headerH = headerDom ? headerDom.offsetHeight : 0;
  let navBarH = navBarDom ? navBarDom.offsetHeight : 0;
  data.tabList.forEach((item) => {
    const target = document.querySelector("#" + item.id);
    target && (item.offsetTop = target.offsetTop);
  });

  if (
    scrollTop >=
    data.tabList[2].offsetTop - headerH - navBarH - rem2px(proxy.$px2rem(240))
  ) {
    // 1364
    data.pageType = 3;
  } else if (
    scrollTop >=
    data.tabList[1].offsetTop - headerH - navBarH - rem2px(proxy.$px2rem(100))
  ) {
    // 362
    data.pageType = 2;
  } else {
    // 70
    data.pageType = 1;
  }
};
const __resizeHandler = () => {
  // 监听窗口大小变化，重新计算css样式，再渲染图表
  data.echartData.windowSize = Math.random();
};

onMounted(() => {
  window.addEventListener("scroll", __scrollHandle, false);
  window.addEventListener("resize", __resizeHandler);
});
onUnmounted(() => {
  window.removeEventListener("scroll", __scrollHandle, false);
  window.addEventListener("resize", __resizeHandler);
});
watch(
  () => store.state.dashBoard.isFinish,
  async (val) => {
    // 数据来源：从外链进入
    if (!val) return false;
    // console.log("state.dashBoard", store.state.dashBoard);
    // data.showTabBar = store.state.dashBoard.showTabBar;
    data.staticTime = store.state.dashBoard.staticTime;
    data.pageTitle = store.state.dashBoard.pageTitle;
    data.dataStatus = store.state.dashBoard.dataStatus;
    data.echartData = store.state.dashBoard.echartData;
    data.pageLoading = store.state.dashBoard.pageLoading;
    data.commandStatus = store.state.dashBoard.commandStatus;
    closeToast();

    // 获取快捷系统列表
    getQuickSysList();
  },
  {
    immediate: true,
    deep: true,
  }
);

const handleCommand = (command) => {
  switch (command) {
    case 1:
      data.commandStatus = 1;
      store.commit("dashBoard/SET_BOARD_DATA", { commandStatus: 1 });
      preData(1);
      startLoading();
      break;
    case 2:
      data.commandStatus = 2;
      store.commit("dashBoard/SET_BOARD_DATA", { commandStatus: 2 });
      preData(2);
      startLoading();
      break;
    case 3:
      console.log("重点系统趋势");
      data.echartData.manyDimensionsUrl &&
        window.open(data.echartData.manyDimensionsUrl, "_blank");
      break;
    case 4:
      exitApp();
      break;
  }
};

const startLoading = () => {
  showLoadingToast({
    message: "加载中...",
    overlayClass: "overlay-toast",
    loadingType: "spinner",
    overlay: true,
    duration: 0,
    "z-index": 9999999,
  });
};

const handleBarClick = (item) => {
  data.pageType = item.pageType;

  let headerDom = document.querySelector(".fix-header");
  let headerH = headerDom ? headerDom.offsetHeight : 0;
  let targetDom = document.querySelector("#" + item.id);

  console.log("targetDom.offsetTop", targetDom.offsetTop);
  console.log("headerH", headerH);
  console.log(
    "targetDom.marginTop",
    parseFloat(getComputedStyle(targetDom, null)?.marginTop || 0)
  );
  document.documentElement.scrollTop =
    targetDom.offsetTop -
    headerH -
    parseFloat(getComputedStyle(targetDom, null)?.marginTop || 0);
};
const onOffsetChange = (offset) => {
  console.log(`x: ${offset.x.toFixed(0)}, y: ${offset.y.toFixed(0)}`);
};

const handleBackTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const sysClick = (row) => {
  console.log("页面跳转", row);
  router.push({
    name: "sysDetails",
    query: {
      sysCode: row.sysCode,
      sysName: row.sysName,
      dateTime: data.staticTime,
    },
  });
};
</script>

<style lang="less" scoped>
.dashBoard {
  // height: 100vh;
  // overflow: auto;
  width: 100%;
  padding: 70px 0 50px 0;
  background-color: #f1f2f9;
  font-size: 12px;
  color: #1d252f;
  position: relative;
  &.no-tabbar-dash-board {
    padding-bottom: 0;
  }
  &.iphone-device {
    // padding: 118px 0 50px 0;
    .fix-header {
      padding-top: 40px;
      height: 118px;
      // height: 70px;
    }
  }
  &.pc-dashBoard {
    .fix-header {
      /deep/.dashboard-nav-bar {
        padding: 0 15px;
      }
      .quick-enter {
        padding: 0 15px;
      }
    }
  }
  .fix-header {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    width: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
    height: 70px;
    // height: 110px;
    background-image: url("~@/assets/images/img-bg.png");
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    box-sizing: border-box;
    /deep/.dashboard-nav-bar {
      background-color: transparent;
      padding: 0 10px;
      &::after {
        border: none;
      }
      .van-nav-bar__content {
        height: 40px;
        line-height: 40px;
      }
      .van-nav-bar__left {
        .nav-bar-title {
          font-size: 13px;
          color: #1d252f;
        }
        padding: 0;
      }
      .van-nav-bar__right {
        padding: 0;
        .van-image {
          width: 22px;
          height: 22px;
        }
      }
      .van-nav-bar__title {
        flex: 1;
        display: flex;
        align-items: center;
        // justify-content: space-around;
        justify-content: space-between;
        padding: 0 40px 0 0;
        max-width: 100%;
        .nav-bar-title {
          font-size: 13px;
          color: #1d252f;
        }
        .header-bar {
          line-height: 18px;
          .header-bar-item {
            font-size: 13px;
            color: #1d252f;
            padding: 0 5px;
          }
          .header-bar-item-active {
            color: #526ae7;
          }
        }
        .nav-bar-time {
          font-size: 13px;
          color: #1d252f;
        }
      }
    }
    .quick-enter {
      display: flex;
      align-items: center;
      flex-direction: row;
      flex-wrap: nowrap;
      font-size: 13px;
      padding: 0 10px;
      color: #1d252f;
      .tabs-box {
        flex: 1;
        background-color: transparent;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        span {
          cursor: pointer;
          text-decoration: underline;
          color: #526ae7;
          margin-right: 7px;
          white-space: nowrap; /* 不换行 */
          overflow: hidden; /* 隐藏超出的内容 */
          text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          // max-width: 40px; /* 设置最大宽度以限制文本的显示长度 */
          min-width: 34px;
        }
      }
    }
  }
  .footer-box {
    margin: 10px 0;
    height: 30px;
    line-height: 30px;
    text-align: center;
    position: relative;
    span {
      display: inline-block;
      padding: 0 15px;
      position: relative;
      color: #8d9eae;
      background-color: #f1f2f9;
      z-index: 2;
    }
    &::after {
      content: "";
      position: absolute;
      top: 15px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #c4c4c4;
      z-index: 1;
    }
  }
}
.no-data-page {
  width: 100%;
  height: 100vh;
  position: relative;
  .not-data-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
<style lang="less">
// .overlay-toast {
//   width: 100%;
//   max-width: var(--max-width);
//   margin: 0 auto;
//   position: fixed;
//   left: 50%;
//   transform: translateX(-50%);
// }
.popper-dashboard {
  z-index: 999999 !important;
  .el-dropdown-menu {
    .el-dropdown-menu__item {
      color: #1d252f;
      font-weight: 700;
    }
    .el-dropdown-menu__item:not(.is-disabled):focus,
    .el-dropdown-menu__item:not(.is-disabled):hover {
      color: #1d252f !important;
      background: #e3ecfa !important;
    }
  }
}
.floating-box {
  width: 39px;
  height: 39px;
  background-color: transparent;
  z-index: 99999;
}
.back-top {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 99999;
  width: 39px;
  height: 39px;
}
</style>
