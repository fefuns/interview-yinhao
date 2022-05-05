/**
 * 校验是否是合法的QQ号码
 * @param str 字符串
 * @returns 
 */
export function isQQ(str: string) {
  return /^[1-9][0-9]{4,9}$/gim.test(str)
}