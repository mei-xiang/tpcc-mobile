import 'core-js/stable'
import 'regenerator-runtime/runtime'
// import 'amfe-flexible'
import { RunWorkH5 } from '@runwork/runwork-help'
import '@/assets/css/main.css'
import '@/assets/css/global.less'

// import 'vant/lib/index.css'
import '@/common/utils/rem'
import '@/common/utils/resizeObserver'
import App from './App.vue'
import router from './router'
import store from './store'
// import { vant } from '@/common/vant.config' // 按需引入vant组件
import { px2rem, isPCBrowser } from '@/common/utils/comm'
import VConsole from 'vconsole'
import { h5jssdk } from '@/common/h5jssdk'
import { createApp } from 'vue'
import noAuth from '@/common/utils/noAuth'
import * as trackWay from '@/common/utils/track-way.js'

/* --------------------------------
Vant 中有个别组件是以函数的形式提供的，
包括 Toast，Dialog，Notify 和 ImagePreview 组件。
在使用函数组件时，unplugin-vue-components
无法自动引入对应的样式，因此需要手动引入样式。
------------------------------------- */
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'

const app = createApp(App)

const isPad = false //! !navigator.userAgent.match(/(iPad)/i) || screen.width > 600// 判断Ipad
const isIphone = /iphone/gi.test(window.navigator.userAgent)

h5jssdk()

if (process.env.NODE_ENV === 'uat' || process.env.NODE_ENV === 'development') {
  /* eslint-disable */
  new VConsole()
}

app.config.globalProperties.$runWorkH5 = RunWorkH5
app.config.globalProperties.$px2rem = px2rem
// app.config.globalProperties.$AnalysysAgent = AnalysysAgent
app.config.globalProperties.$isPad = isPad
app.config.globalProperties.$isIphone = isIphone
app.config.globalProperties.$trackWay = trackWay
// app.config.globalProperties.$isPCBrowser = navigator?.userAgentData?.mobile === false // true 代表当前设备是移动设备
app.config.globalProperties.$isPCBrowser = isPCBrowser()

// 初始化埋点
trackWay.trackInit()

// AnalysysAgent.init({
//   appkey: process.env.VUE_APP_APPKEY, // APPKEY
//   uploadURL: process.env.VUE_APP_UPLOADURL, // 上传数据的地址
//   debugMode: process.env.VUE_APP_ISLOCAL === '0' ? 0 : 0,
//   autoTrack: false // 开启全埋点
// })

console.log('main进来了吗');
// run3token过期，清空缓存，插件初始化失败会内部最多重试3次，要是有缓存有旧数据(像token)，就不会重新赋值
sessionStorage.clear();
localStorage.clear();

app
  .use(RunWorkH5, {
    env: process.env.VUE_APP_ENV,
    appId: process.env.VUE_APP_APPID,
    isLocal: process.env.VUE_APP_ISLOCAL === '0',
    devUser: 'zhongguobang', // HUAXIAORUN2 zhangshiqi16 zhongguobang HUAXIAORUN7 LPDTEST1 
    isVue3: true,
    isJssdkAuth: false,
    isCross: true,
    larkexpires: false
  })
  // .use(vant)
  .use(store)
  .use(noAuth)
  .use(router)
  .mount('#app')
