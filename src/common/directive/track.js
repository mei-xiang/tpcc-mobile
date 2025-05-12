import AnalysysAgent from 'ans-javascript-sdk'
import store from '../../store'

let getProxy = ''
let router = ''

// 变量转中文对照表
const list = {
  ca1: '全口径',
  ca2: '权益口径'
}

export const track = (proxy, getRouter) => {
  if (proxy) {
    getProxy = proxy
    router = getRouter
  }
}

// 登录时间
export const trackLogin = (date) => {
}

// 登出时间
export const trackLogout = (proxy) => {
}

// 初始化埋点
export default (app) => {
  app.directive('track', {
    mounted (el, binding, vnode) {
      const data = {
        context: store.state.user.context,
        title1: store.state.user.title1,
        title2: store.state.user.title2
      }
      if (router.currentRoute.value.path.indexOf('businessDynamics') > 0) {
        AnalysysAgent.profileSet({
          filter_tiers: store.state.user.filter_tiers,
          filter_time: store.state.user.filter_time,
          ...data,
          ...binding.value
        })
      } else if (router.currentRoute.value.path.indexOf('proArchives') > 0) {
        AnalysysAgent.profileSet({
          ...data,
          ...binding.value
        })
      }

      // 点击采集
      el.addEventListener('click', (res) => {
        const value = binding.value
        const arg = binding.arg
        let act = ''
        const obj = {}
        for (const key in arg) {
          act = arg[key]
        }
        for (const key in list) {
          if (key === act) {
            act = list[key]
          }
        }
        obj[value.act] = act
        setTimeout(() => {
          if (router.currentRoute.value.path.indexOf('businessDynamics') > 0) {
            AnalysysAgent.profileSet({
              filter_tiers: store.state.user.filter_tiers,
              filter_time: store.state.user.filter_time,
              ...data,
              ...binding.value,
              ...obj
            })
          }
        }, 1000)
      }, false)
    }

  })
}

// 点击埋点
export const getTrack = (res) => {
  console.log(res, 3333333)

  return 1234
}

// run3track
// 登出时间
export const handleRun3track = (proxy) => {
  getProxy.$runWorkH5
    .run3track({
      // 埋点传参
      category: '111222',
      action: '2332',
      extendField: {
        la: '123',
        long: '11'
      },
      aaa: {
        la: '123',
        long: '11'
      }
    }).then(res => {
    })
}
