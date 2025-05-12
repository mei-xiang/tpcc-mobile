import AnalysysAgent from "asd-javascript-sdk";
import { removeNull } from "@/common/utils/comm.js";
import router from "@/router/index.js";

// 初始化埋点
export function trackInit() {
  AnalysysAgent.init({
    appkey: process.env.VUE_APP_TRACK_APPKEY, //(必须) 在网站获取的 AppKey
    debugMode: 2, //设置调试模式：0 - 关闭调试模式(默认)；1 - 开启调试模式，数据不入库；2 - 开启调试模式，数据入库
    uploadURL: process.env.VUE_APP_TRACK_UPLOAD_URL, //(必须) 设置上传数据接口
    autoTrack: false, //设置是否启用全埋点功能：false - 不启用全埋点功能(默认)；true - 启用全埋点功能（SDK 版本 4.4.0 及以后支持）
    hash: false, // 设置是否开启 hash 值采集：false - 关闭 hash 值采集；true - 开启 hash 值采集(默认)
    auto: false, // 设置自动采集页面打开事件： false - 关闭自动采集；true - 开启自动采集(默认)
    pageViewBlackList: [
      // 不采集页面数据
      () => {
        let blackList = ["/", "/toDoList", "/details"];
        let meta =
          router.currentRoute &&
          router.currentRoute.value.path
            ? router.currentRoute.value.path
            : '';
        if (blackList.includes(meta)) {
          return true;
        }
        return false;
      },
    ],
  });
}

// 关联用户
export function trackAlias(ldap) {
  AnalysysAgent.alias(ldap, () => {
    console.log("用户关联成功");
  });
}

// 设置用户属性
export function trackProfileSet(userInfo) {
  AnalysysAgent.profileSet(removeNull(userInfo));
}

// 注册通用属性，每次数据上传都会携带
export function registerSuperProperties(eventInfo = {}) {
  // let meta =
  //   router.currentRoute && router.currentRoute.value && router.currentRoute.value.meta
  //     ? router.currentRoute.value.meta
  //     : {}
  // console.log('注册通用属性', router)

  let superProperty = Object.assign(
    {
      sys_name: process.env.VUE_APP_SYS_NAME,
      sys_code: process.env.VUE_APP_SYS_CODE,
      // first_level: meta.first_level,
      // sec_level: meta.sec_level,
      // thd_level: meta.thd_level,
      // forh_level: meta.forh_level,
    },
    eventInfo
  );
  console.log("superProperty", superProperty);
  AnalysysAgent.registerSuperProperties(removeNull(superProperty));
}

// 统计页面访问
export function trackPageView(pageName = "", info = {}) {
  AnalysysAgent.pageView(pageName, removeNull(info));
}

// 自定义事件
export function trackCustomEv(eventName, eventInfo) {
  AnalysysAgent.track(eventName, removeNull(eventInfo));
}
