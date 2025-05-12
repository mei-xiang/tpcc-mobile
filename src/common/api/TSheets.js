import { request } from '@/common/require/index'

// 工时详情 - 系统 / 项目下拉框
export function getSysProjectInfoList (data) {
  return request({
    api: 'getSysProjectInfoList',
    url: '/tpcc-business-service/business/api/ssdp/working/getSysProjectInfoList',
    method: 'POST',
    data
  })
}

// 查询工时信息
export function queryWorkingHours (data) {
  return request({
    api: 'queryWorkingHours',
    url: '/tpcc-business-service/business/api/ssdp/working/queryWorkingHours',
    method: 'POST',
    data
  })
}

// 编辑工时信息
export function editWorkingHours (data) {
  return request({
    api: 'editWorkingHours',
    url: '/tpcc-business-service/business/api/ssdp/working/editWorkingHours',
    method: 'POST',
    data
  })
}

// 工时审批详情
export function getWorkingApprovalDetails (data) {
  return request({
    api: 'getWorkingApprovalDetails',
    url: '/tpcc-business-service/business/api/ssdp/working/getWorkingApprovalDetails',
    method: 'POST',
    data
  })
}

// 工时审批详情-用户明细
export function getUserWorkingDetails (data) {
  return request({
    api: 'getUserWorkingDetails',
    url: '/tpcc-business-service/business/api/ssdp/working/getUserWorkingDetails',
    method: 'POST',
    data
  })
}

// 工时审批详情-工时确认
export function confirmWorking (data) {
  return request({
    api: 'confirmWorking',
    url: '/tpcc-business-service/business/api/ssdp/working/confirmWorking',
    method: 'POST',
    data
  })
}
