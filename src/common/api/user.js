import { request } from '@/common/require/index'

// 获取token
export const authToken = (data) => {
  return request({
    api: 'getToken',
    url: '/tpcc-login-service/login/bam7/auth/getToken',
    noHeadersToken: true, // 请求头不带token
    method: 'POST',
    data
  })
}

// 公共业务处理接口
export const commonBusinessHandle = (businessType) => {
  return request({
    api: 'commonBusinessHandle',
    url: '/tpcc-business-service/business/api/ssdp/ecsb/common/business/handle',
    method: 'post',
    data: { businessType }
  })
}

// 获取待办列表
export const getReviewTodoList = (data) => {
  return request({
    api: 'reviewTodoList',
    url: '/tpcc-business-service/business/api/ssdp/review-todo-list',
    method: 'POST',
    data
  })
}

// 获取审批已办列表
export const getReviewDoneList = (data) => {
  return request({
    api: 'reviewDoneList',
    url: '/tpcc-business-service/business/api/ssdp/review-done-list',
    method: 'POST',
    data
  })
}

// 获取审批详情
export const getReviewDetail = (data) => {
  return request({
    api: 'reviewDetail',
    url: '/tpcc-business-service/business/api/ssdp/review-detail',
    method: 'POST',
    data
  })
}

// 待办提交
export const reviewSubmit = (data) => {
  return request({
    api: 'reviewSubmit',
    url: '/tpcc-business-service/business/api/ssdp/review-submit',
    method: 'POST',
    data
  })
}

// 文件预览
export const filePreview = (data) => {
  return request({
    api: 'filePreview',
    url: '/tpcc-common-service/common/api/ssdp/file-preview',
    method: 'POST',
    data
  })
}
// 获取待办待阅标记
export const getIsRedDot = (data) => {
  return request({
    api: 'isRedDot',
    url: '/tpcc-business-service/business/api/ssdp/isRedDot',
    method: 'POST',
    data
  })
}
// 获取待阅已阅列表
export const getPageReviewRead = (data) => {
  return request({
    api: 'pageReviewRead',
    url: '/tpcc-business-service/business/api/ssdp/pageReviewRead',
    method: 'POST',
    data
  })
}
// 获取待阅转已阅
export const getUpdateReadStatus = (data) => {
  return request({
    api: 'updateReadStatus',
    url: '/tpcc-business-service/business/api/ssdp/updateReadStatus',
    method: 'POST',
    data
  })
}
