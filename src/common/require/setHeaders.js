import { getToken } from '@/common/utils/auth'

export const setHeaders = (requireConfig) => {
  let headers = { ...requireConfig.headers }
  // 请求头是否不带token
  if (!requireConfig.noHeadersToken) {
    headers = {
      token: 'Bearer ' + getToken(),
      Authorization: 'Bearer ' + getToken(),
      ...headers
    }
  }

  return headers
}
