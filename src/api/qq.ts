/**
 * 所有与QQ相关的接口。真正项目更习惯的是 src/api 文件夹下只放全局相关的接口。而页面独立的接口放在页面自身的文件夹下。例如 views/QQSearch/index.tsx  views/QQSearch/api.ts
 */
import http from 'utils/http';
// 获取qq信息
export const getQqInfo = (params: object) => http('get /qq.info', { params })