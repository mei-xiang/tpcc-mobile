<template>
  <Welcome :imageType="data.imageType"></Welcome>

  <!-- <router-view
    v-if="data.show"
    v-slot="{ Component }"
    @touchmove="data.touchmove"
    @touchend="data.touchend"
  >
    <keep-alive :include="['DashBoard']">
      <component :is="Component" :key="route.fullPath"></component>
    </keep-alive>
  </router-view> -->

  <router-view
    v-if="data.show"
    @touchmove="data.touchmove"
    @touchend="data.touchend"
  />
</template>
<script setup>
import {
  provide,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  reactive,
  toRefs,
  watch,
  computed,
} from "vue";
import Welcome from "@/components/Welcome";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { ecsb } from "@/common/require/ecsb";
import { auth } from "@/common/auth";
import { preData } from "@/views/mobile/dashBoard/utils.js";
import { getUrlParams } from "@/common/utils/comm.js";

const store = useStore();
const route = useRoute();
const { proxy } = getCurrentInstance();
let authData = {};
const data = reactive({
  isPad: proxy.$isPad,
  imageType: true,
  auth: false,
  show: false,
  showTop: true,
  showButtom: true,
  scrollTop: 0,
  offsetLv1: 0,
  offsetLv2: 0,
  selectUp: 0,
  ecsbType: false,
  handleScroll: () => {
    // 页面滚动距顶部距离
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    const scroll = scrollTop - data.num;
    data.num = scrollTop;
    if (scrollTop > 30) {
      data.showTop = scroll < 0;
      data.scrollTop = scrollTop;
    }
  },
  touchmove: () => {
    data.showButtom = false;
  },
  touchend: () => {
    data.showButtom = true;
  },
});

// const isKeepAlive = computed(() => {
//   console.log('route.meta.keepAlive', route.meta.keepAlive);
//   return route.meta && route.meta.keepAlive
// })

// 监听路由和用户信息变化，确保上报pageview事件时有用户信息
// 监听路由变化
watch(
  () => route,
  (newRoute, oldRoute) => {
    console.log("路由变化信息", newRoute, oldRoute);
    if (!newRoute) return false;
    if (
      !store.state.user.hasUserInfo ||
      Object.keys(store.state.user.userInfo).length <= 0
    )
      return false;
    setTimeout(() => {
      // 在这里可以执行路由变化时需要做的任何逻辑
      reportPageView(newRoute);
    }, 50);
  },
  { deep: true }
);
// 监听用户信息变化
watch(
  () => store.state.user.hasUserInfo,
  (newData, oldData) => {
    setTimeout(() => {
      if (!newData || Object.keys(store.state.user.userInfo).length <= 0)
        return false;
      reportPageView(route);
    }, 150);
  }
);

const reportPageView = (route) => {
  proxy.$trackWay.trackPageView(route.meta.title, {
    first_level: route.meta.first_level,
    sec_level: route.meta.sec_level,
    thd_level: route.meta.thd_level,
    forh_level: route.meta.forh_level,
    role: "",
    role_org: "",
  });
};
// 是否从外链进入运维看板
const isBoardLinkEnter = getUrlParams(location.href).dateTime ? true : false;

if (!isBoardLinkEnter) {
  proxy.$runWorkH5
    .initReady()
    .then(async () => {
      console.log("proxy.$runWorkH5", proxy.$runWorkH5);
      await ecsb(proxy);
      // data.imageType = false
      authData = {
        // appSecret: proxy.$runWorkH5.appSecret,
        runWorkToken: proxy.$runWorkH5.runWorkToken,
        userId: proxy.$runWorkH5.user.user_id,
      };
      localStorage.setItem("authData", JSON.stringify(authData));
      await auth(authData);
      store.dispatch("getUserInfo", "userInfo").then((res) => {
        if (!res) return;
        let userInfo = store.state.user.userInfo || {};
        let orgNameList = userInfo.orgNameList || [];
        proxy.$trackWay.trackAlias(userInfo.username);
        proxy.$trackWay.registerSuperProperties({
          role: userInfo.roleList.length > 0 ? userInfo.roleList[0].name : "",
        }); // 绑定事件通用属性
        proxy.$trackWay.trackProfileSet({
          // org_name: (orgNameList && orgNameList.length > 0 && orgNameList[0]) ? orgNameList[0] : '未知',
          // real_name: userInfo.realName

          emp_name: userInfo.realName, // 用户名
          ldap: userInfo.username, // ldap账号，大写
          org_name:
            orgNameList && orgNameList.length > 0 && orgNameList[0]
              ? orgNameList[0]
              : "未知", // 组织名称
          role_list:
            userInfo.roleList.length > 0
              ? userInfo.roleList.map((_) => _.name)
              : [], // 角色列表
        });
      });
      data.imageType = false;
      data.show = true;
    })
    .catch((err) => {
      console.log("initReady--catch非外链", err);
      // token过期，插件会自动重试3次
      if (err.indexOf("E0S0A104") !== -1 || err.indexOf("E0S0A106") !== -1) {
        console.log("这里进来了吗");
        sessionStorage.clear();
        localStorage.clear();
      }
    });
} else {
  proxy.$runWorkH5
    .initReady()
    .then(async () => {
      console.log("proxy.$runWorkH5", proxy.$runWorkH5);
      await ecsb(proxy);
      // 预加载运维看板数据
      preData(); // TODO--难道是token过期了，调用这个接口报错？(本机登录uat看效果，王捷生产看效果---天龙的问题)
      data.imageType = false;
      data.show = true;
      authData = {
        runWorkToken: proxy.$runWorkH5.runWorkToken,
        userId: proxy.$runWorkH5.user.user_id,
      };
      localStorage.setItem("authData", JSON.stringify(authData));
      auth(authData).then((rest) => {
        if (!rest) return;
        store.dispatch("getUserInfo", "userInfo").then((res) => {
          if (!res) return;
          let userInfo = store.state.user.userInfo || {};
          let orgNameList = userInfo.orgNameList || [];
          proxy.$trackWay.trackAlias(userInfo.username);
          proxy.$trackWay.registerSuperProperties({
            role: userInfo.roleList.length > 0 ? userInfo.roleList[0].name : "",
          }); // 绑定事件通用属性
          proxy.$trackWay.trackProfileSet({
            // org_name: (orgNameList && orgNameList.length > 0 && orgNameList[0]) ? orgNameList[0] : '未知',
            // real_name: userInfo.realName

            emp_name: userInfo.realName, // 用户名
            ldap: userInfo.username, // ldap账号，大写
            org_name:
              orgNameList && orgNameList.length > 0 && orgNameList[0]
                ? orgNameList[0]
                : "未知", // 组织名称
            role_list:
              userInfo.roleList.length > 0
                ? userInfo.roleList.map((_) => _.name)
                : [], // 角色列表
          });
        });
      });
    })
    .catch((err) => {
      console.log("initReady--catch外链", err);
      // token过期，插件会自动重试3次
      if (err.indexOf("E0S0A104") !== -1 || err.indexOf("E0S0A106") !== -1) {
        console.log("这里进来了吗");
        sessionStorage.clear();
        localStorage.clear();
      }
    });
}

onMounted(() => {
  window.addEventListener("scroll", data.handleScroll, true);
  sessionStorage.removeItem("app_mounted");
  console.log(
    window.location.href.split("?")[0].split("#")[0],
    "00000000000000000"
  );
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", data.handleScroll, true);
});

provide("appData", data); // 存入获取
</script>
<style lang="less">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  color: #2c3e50;
  font-size: 6.25%;
}

.tabbar-wrapper {
  z-index: 10000000 !important;
}

/* 动画 */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0.1;
}
</style>
