/**
 * 基于 axios 二次封装 http 请求
 */
import axios, { AxiosRequestConfig } from 'axios';
import { stringify } from 'qs';

const service = axios.create({
  baseURL: '/api',
})

/**
 * 用于根据当前请求的信息，生成请求 Key；
 * @param {*} config
 * @returns
 */
function generateReqKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config;
  return [method, url, stringify(params), stringify(data)].join('&');
}
const pendingRequest = new Map();
/**
 * 用于把当前请求信息添加到pendingRequest对象中
 */
function addPendingRequest(config: AxiosRequestConfig) {
  const requestKey = generateReqKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel);
      }
    });
}
/**
 * 检查是否存在重复请求，若存在则取消已发的请求。
 * @param {*} config
 */
function removePendingRequest(config: AxiosRequestConfig) {
  const requestKey = generateReqKey(config);
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey);
    cancelToken(requestKey);
    pendingRequest.delete(requestKey);
  }
}
// 添加请求拦截器
service.interceptors.request.use(
  config => {
    removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求
    addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    // 下载文件时
    if (response.config.responseType === 'blob') {
      return res;
    }
    if (res.code !== 1) {
      Promise.reject(res);
      return res;
    } else {
      return res;
    }
  },
  error => {
    removePendingRequest(error.config || {}) // 从 pendingRequest 对象中移除请求
    if (axios.isCancel(error)) {
      console.log(`已取消的重复请求: ${error.message}`);
    } else {
      // 添加异常处理
      // console.log('请求超时')
    }
    return Promise.reject(error);
  }
)
// 所有请求方式
const options = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];
/**
 * 对外暴露的http方法
 * 示例
 * const updateUserInfo = (userId, data) => http(`get /user/info/${userId}`, {data})
 * @param {*} requestUrl 
 * @param {*} arg 
 * @param {*} config 
 * @returns 
 */

const http = (requestUrl: string, arg: { params?: object, data?: object }, config?: AxiosRequestConfig) => {
  const { params, data } = arg || {};
  const method = requestUrl.split(' ')[0];
  const url = requestUrl.split(' ')[1];
  if (options.indexOf(method.toUpperCase()) === -1) {
    console.error('请求方式不存在！')
    return;
  }
  if (!url) {
    console.error('请求地址不存在！')
    return;
  }
  const configs = {
    url,
    method,
    params,
    data,
    validateStatus: null, // 所有响应都resolve
    ...config,
  }
  return service(configs)
}

export default http;