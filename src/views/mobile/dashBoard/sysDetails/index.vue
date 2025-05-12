<template>
  <div :class="['sysDetails', $isIphone ? 'iphone-device' : '']">
    <div class="fix-header">
      <NavBar class="nav-bar" :title="data.sysName" slotRight isBack>
        <template #nav-right> {{ formatDate(data.staticTime, "/") }} </template>
      </NavBar>
      <page-type-bar
        :pageType="data.pageType"
        :tabList="data.tabList"
        @handleBarClick="handleBarClick"
      ></page-type-bar>
    </div>

    <component
      v-for="(tab, tabIdx) in data.tabList"
      :key="tab.pageType"
      :is="componentMap[tab.pageType]"
      v-bind="{
        isFirstTab: tabIdx === 0,
        staticTime: data.staticTime,
        sysCode: data.sysCode,
        userData: data.userData,
        sysData: data.sysData,
        businessData: data.businessData,
        menuTree: runeMenuTree(deepClone(data.menuTree), 4),
        orgTree: deepClone(data.orgTree),
        roleTree: deepClone(data.roleTree),
        deviceTree: runeMenuTree(deepClone(data.deviceTree), 4),
        isFinished: data.isFinished,
        baseInfo: data.baseInfo,
      }"
      v-on="{ scrollToPlace }"
    ></component>

    <div class="footer-box">
      <span>没有更多内容了</span>
    </div>

    <!-- 悬浮球 -->
    <template v-if="!$isPCBrowser">
      <van-floating-bubble
        axis="xy"
        magnetic=""
        :gap="floatObj.gap"
        class="sys-floating-box"
        @offset-change="onOffsetChange"
        @click="handleBackTop"
      >
        <img
          v-show="floatObj.showBack"
          class="sys-back-top"
          :src="require('@/assets/images/dashBoard/back-top.svg')"
          alt=""
        />
      </van-floating-bubble>
    </template>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  markRaw,
  shallowRef,
} from "vue";
import NavBar from "@/components/NavBar";
import pageTypeBar from "../components/pageTypeBar";
import userAnalysis from "./userAnalysis.vue";
import pageViewAnalysis from "./pageViewAnalysis.vue";
import businessAnalysis from "./businessAnalysis.vue";
import baseInfo from "./baseInfo.vue";
import {
  rem2px,
  formatDate,
  convertTree,
  addFieldToNodes,
  deepClone,
  runeMenuTree,
  addIdToNodes,
} from "@/common/utils/comm";
import { useRoute } from "vue-router";
import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showLoadingToast, showFailToast, closeToast } from "vant";
import { debounce } from "lodash";

const { proxy } = getCurrentInstance();
const route = useRoute();
const tabList = [
  {
    pageTitle: "用户分析",
    pageType: "userAnalysis",
    offsetTop: 0,
    sort: 1,
  },
  {
    pageTitle: "系统分析",
    pageType: "pageViewAnalysis",
    offsetTop: 0,
    sort: 2,
  },
  {
    pageTitle: "业务分析",
    pageType: "businessAnalysis",
    offsetTop: 0,
    sort: 3,
  },
  {
    pageTitle: "基础信息",
    pageType: "baseInfo",
    offsetTop: 0,
    sort: 4,
  },
];
const getTabList = (sortList) => {
  const list = [];
  sortList.forEach((item) => {
    tabList.forEach((_item) => {
      if (item === _item.sort) {
        list.push(_item);
      }
    });
  });
  return list;
};

// 使用 shallowRef 来存储组件
const componentMap = shallowRef({
  userAnalysis: markRaw(userAnalysis),
  pageViewAnalysis: markRaw(pageViewAnalysis),
  businessAnalysis: markRaw(businessAnalysis),
  baseInfo: markRaw(baseInfo),
});

const data = reactive({
  sysName: "",
  staticTime: route.query.dateTime,
  sysCode: route.query.sysCode,
  pageType: "",
  tabList: [],
  pageData: {}, // 系统详情数据--系统详情接口获取
  userData: {}, // 用户分析数据
  sysData: {}, // 系统分析数据
  businessData: {}, // 业务分析数据
  baseInfo: {}, // 基础信息
  menuTree: [], // 菜单级联树
  orgTree: [], // 组织级联树
  roleTree: [], // 角色级联树
  deviceTree: [], // 设备级联树
  isFinished: false,
});
// Unilink物联网平台，业务分析在前
if (data.sysCode === "CR005-IOTUNILINK") {
  data.pageType = "businessAnalysis";
  data.tabList = getTabList([3, 1, 2, 4]);
} else {
  data.pageType = "userAnalysis";
  data.tabList = getTabList([1, 2, 3, 4]);
}

const floatObj = ref({
  gap: rem2px(proxy.$px2rem(24)),
  showBack: false,
});

const initData = async () => {
  showLoadingToast({
    message: "加载中...",
    overlay: true,
    loadingType: "spinner",
    overlayClass: "overlay-toast",
    zIndex: 9999999,
    duration: 0,
  });

  // 获取系统详情数据
  getSysDetailsData().then((res) => {
    data.isFinished = true;
    data.pageData = res;
    data.userData = res; // 获取用户分析数据
    data.sysName = res.sysName || route.query.sysName;
    data.baseInfo = res.sysBasicInfo || {};

    closeToast();
  });

  // 获取业务分析数据
  getBusinessData().then((res) => {
    data.businessData = res;
  });

  // 获取系统分析数据
  getSysData().then((res) => {
    data.sysData = res;
  });

  // 获取设备级联树
  getTreeData("operationSystemBusinessTree").then((res) => {
    let list = res || [];
    // data.deviceTree = addIdToNodes(list);
    data.deviceTree = list;
    console.log("data.deviceTree", data.deviceTree);
  });
  // 获取菜单级联树
  getTreeData("operationSystemMenuTree").then((res) => {
    let list = res || [];
    // data.menuTree = addIdToNodes(list);
    data.menuTree = list;
    console.log("data.menuTree", data.menuTree);
  });
  // 获取组织级联树
  getTreeData("operationSystemOrgTree").then((res) => {
    let list = res || [];
    // data.orgTree = addIdToNodes(list);
    data.orgTree = list;
    console.log("data.orgTree", data.orgTree);
  });
  // 获取角色级联树
  getTreeData("operationSystemRoleTree").then((res) => {
    let list = res || [];
    // data.roleTree = addIdToNodes(list);
    data.roleTree = list;
    console.log("data.roleTree", data.roleTree);
  });
};
const getSysDetailsData = async () => {
  return getPublicBusiness({
    businessType: "operationSystemDetails",
    dateStr: data.staticTime,
    sysCode: data.sysCode,
  })
    .then((res) => {
      let resData = {};
      if (res.code === 200) {
        resData = res.data || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
      return resData;
    })
    .catch((err) => {
      console.log("err", err);
      showFailToast("接口异常");
      return {};
    });
};
// 获取业务分析数据
const getBusinessData = async () => {
  return getPublicBusiness({
    businessType: "operationSystemDetails",
    queryCode: "system_details_business_analysis",
    dateStr: data.staticTime,
    sysCode: data.sysCode,
  })
    .then((res) => {
      let resData = {};
      if (res.code === 200) {
        resData = res?.data?.businessAnalysis || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
      return resData;
    })
    .catch((err) => {
      console.log("err", err);
      showFailToast("接口异常");
      return {};
    });
};
// 获取系统分析数据
const getSysData = async () => {
  return getPublicBusiness({
    businessType: "operationSystemDetails",
    queryCode: "system_details_system_analysis",
    dateStr: data.staticTime,
    sysCode: data.sysCode,
  })
    .then((res) => {
      let resData = {};
      if (res.code === 200) {
        resData = res.data || {};
      } else {
        showFailToast(res.message || "接口异常");
      }
      return resData;
    })
    .catch((err) => {
      console.log("err", err);
      showFailToast("接口异常");
      return {};
    });
};
// 获取级联树数据
const getTreeData = async (businessType) => {
  const fieldMap = {
    operationSystemMenuTree: {
      id: "menuId",
      name: "menuName",
      value: "visitNumber",
    },
    operationSystemOrgTree: {
      id: "orgId",
      name: "orgName",
      value: "visitNumber",
    },
    operationSystemRoleTree: {
      id: "roleId",
      name: "roleName",
      value: "visitNumber",
    },
    operationSystemBusinessTree: {
      id: "businessId",
      name: "businessName",
      value: "value",
    },
  };
  let id = fieldMap[businessType].id;
  let name = fieldMap[businessType].name;
  let value = fieldMap[businessType].value;
  let treeData = await getPublicBusiness({
    businessType,
    dateStr: data.staticTime,
    sysCode: data.sysCode,
  }).then((res) => {
    if (res.code === 200) {
      let list = [];
      let arr = [];
      if (businessType === "operationSystemMenuTree") {
        list = res.data ? [res.data] : [];
      } else if (businessType === "operationSystemOrgTree") {
        list = res.data ? [res.data] : [];
      } else if (businessType === "operationSystemRoleTree") {
        list = res?.data?.children || [];
      } else if (businessType === "operationSystemBusinessTree") {
        list = res.data ? [res.data] : [];
      }
      arr = convertTree(list, id, name, value); // 级联树字段映射
      return addFieldToNodes(arr); // 级联树添加层级
    } else {
      showFailToast(res.message || "接口异常");
    }
  });
  return treeData || [];
};

initData();

const __scrollHandle = debounce(() => {
  const scrollTop =
    document.body.scrollTop || document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const offsetheight = document.documentElement.offsetHeight;
  floatObj.value.showBack = scrollTop >= 200;

  const headerDom = document.querySelector(".fix-header");
  const headerH = headerDom ? headerDom.offsetHeight : 0;
  data.tabList.forEach((item) => {
    const target = document.querySelector("#" + item.pageType);
    target && (item.offsetTop = target.offsetTop);
  });

  // console.log("scrollTop", scrollTop);
  // scrollTop + clientHeight = offsetheight
  // if (scrollTop + clientHeight + rem2px(proxy.$px2rem(50)) >= offsetheight) {
  //   data.pageType = "baseInfo";
  // } else if (
  //   scrollTop >=
  //   data.tabList[2].offsetTop - headerH
  //   // data.tabList[1].offsetTop - headerH - rem2px(proxy.$px2rem(100))
  // ) {
  //   data.pageType = "businessAnalysis";
  // } else if (
  //   scrollTop >=
  //   data.tabList[1].offsetTop - headerH
  //   // data.tabList[1].offsetTop - headerH - rem2px(proxy.$px2rem(100))
  // ) {
  //   data.pageType = "pageViewAnalysis";
  // } else {
  //   data.pageType = "userAnalysis";
  // }

  for (let i = data.tabList.length - 1; i >= 0; i--) {
    // 最后一个tab，如果滚动条距离底部大于5px，则显示为baseInfo
    // scrollTop + clientHeight = offsetheight
    if (scrollTop + clientHeight + rem2px(proxy.$px2rem(5)) >= offsetheight) {
      data.pageType = data.tabList[i].pageType;
      break;
    }
    // 当前tab，如果滚动条距离顶部大于header+150px，则显示为当前tab
    if (
      scrollTop >=
      data.tabList[i].offsetTop - headerH - rem2px(proxy.$px2rem(150))
    ) {
      data.pageType = data.tabList[i].pageType;
      break;
    }
  }
}, 20);

onMounted(() => {
  window.addEventListener("scroll", __scrollHandle, false);
  window.addEventListener("resize", __resizeHandler);
});
onUnmounted(() => {
  window.removeEventListener("scroll", __scrollHandle, false);
  window.addEventListener("resize", __resizeHandler);
});

const __resizeHandler = () => {
  // 监听窗口大小变化，重新计算css样式，再渲染图表
  // data.echartData.windowSize = Math.random();
};

const handleBarClick = (item, count = 1) => {
  if (count > 2) return;
  data.pageType = item.pageType;
  const headerDom = document.querySelector(".fix-header");
  const headerH = headerDom ? headerDom.offsetHeight : 0;
  const targetDom = document.querySelector("#" + item.pageType);

  // 获取元素相对于整个文档的距离
  const getElementTop = (element) => {
    if (!element) return 0 + window.scrollY; // 判断元素是否存在

    // 元素相对于视口（viewport）顶部的距离
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  };
  const topDistance = getElementTop(targetDom);
  document.documentElement.scrollTop = topDistance - headerH;

  setTimeout(() => {
    handleBarClick(item, count + 1);
  }, 0);
};
const scrollToPlace = (item) => {
  handleBarClick(item);
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
</script>

<style lang="less" scoped>
@import "@/assets/css/sysDetails.less";
</style>
<style lang="less">
.sys-floating-box {
  width: 39px;
  height: 39px;
  background-color: transparent;
  z-index: 1;
}
.sys-back-top {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1;
  width: 39px;
  height: 39px;
}
</style>
