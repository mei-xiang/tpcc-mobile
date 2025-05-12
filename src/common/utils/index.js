// 生成一个XX位的随机字符串
export const generateRandomId = (num = 13) => {
  return Math.random().toString(36).substring(2, num);
};
