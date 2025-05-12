import { authToken, commonBusinessHandle } from '@/common/api/user'
import { getToken, setToken } from '@/common/utils/auth'

const user = {
  state: {
    token: getToken(),
    hasUserInfo: false,
    userInfo: sessionStorage.getItem('userInfo') || '',
    active: 'todo',
    sysActive: ''
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USERINFO: (state, userInfo) => {
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
      state.userInfo = userInfo
    },
    SET_HAS_USER_INFO: (state, data) => {
      state.hasUserInfo = data
    },
    SET_ACTIVE: (state, data) => {
      state.active = data
    },
    SET_SYS_ACTIVE: (state, data) => {
      state.sysActive = data
    }
  },
  actions: {
    // 登录
    /* eslint-disable */
    getTokenCode({ commit }, req) {
      return new Promise((resolve, reject) => {
        authToken(req)
          .then((res) => {
            setToken(res.data.accessToken)
            commit('SET_TOKEN', res.data.accessToken)
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    },
    getUserInfo({ commit }, payload) {
      return new Promise((resolve, reject) => {
        commonBusinessHandle(payload)
          .then((res) => {
            console.log('用户信息：', res);
            commit('SET_USERINFO', res.data.data || {})
            commit('SET_HAS_USER_INFO', true)
            resolve(true)
          })
          .catch(() => {
            commit('SET_HAS_USER_INFO', false)
            resolve(false)
          })
      })
    }
  }
}

export default user
