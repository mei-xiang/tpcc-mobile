/**
 * 2023-01-19
 * 轻应用请求统一入口，集成了axios和 ecsb
 */

import { ecsbRequire } from './ecsb'
import axiosRequire from './request'

/* eslint-disable */
export function request(requireConfig) {
  // 是否已启用ecsb
  const ecsbType = process.env.VUE_APP_ECSBTYPE === '1'
  // 如果是启用了ecsb就用 runWorkH5.ssdpRequestApp 去请求，反之则用 axios
  return ecsbType ? ecsbRequire(requireConfig) : axiosRequire(requireConfig)
}
