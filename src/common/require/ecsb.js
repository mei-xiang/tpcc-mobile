import { setHeaders } from '@/common/require/setHeaders'
let getProxy = ''
export const ecsb = (proxy) => {
  if (proxy) {
    getProxy = proxy
  }
}

/**
 *
 * @param { * } requireConfig 请求配置
 * @returns
 */

export const ecsbRequire = (requireConfig) => {
  return new Promise((resolve, reject) => {
    const obj = {
      version: '1.0',
      isFormatData: false,
      ...requireConfig,
      api: process.env.VUE_APP_ECSBURL + '.' + requireConfig.api,
      ...setHeaders(requireConfig)
    }

    console.log('obj:', obj)
    getProxy.$runWorkH5
      .ssdpRequestApp({
        version: '1.0',
        isFormatData: false,
        ...obj,
        headers: {
          ...setHeaders(requireConfig)
        }
      })
      .then((response) => {
        console.log('responsesss:', response.data)

        // resolve(JSON.parse(response.RETURN_DATA)?.data)
        resolve(response.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
