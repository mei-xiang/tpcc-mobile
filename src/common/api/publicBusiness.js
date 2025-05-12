import { request } from '@/common/require/index'

// 公共业务接口
export function getPublicBusiness (data) {
  return request({
    api: 'public.commonBusinessHandle',
    noHeadersToken: true, // 请求头不带token
    url: '/tpcc-business-service/business/public/api/ssdp/ecsb/common/public/business/handle',
    method: 'POST',
    data
  })
}