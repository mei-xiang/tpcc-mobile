import axios from 'axios'
import { setHeaders } from '@/common/require/setHeaders'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 10 * 1000
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    config.headers = { ...setHeaders(config) }
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 403  状态码捕获
    if (res && res.code === '403') {
      // loginAgain();
      return Promise.reject(res)
    }

    return Promise.resolve(res)
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
