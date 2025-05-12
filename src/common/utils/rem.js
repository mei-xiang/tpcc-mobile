// // 设置 rem 函数
// const oWidth = document.body.clientWidth || document.documentElement.clientWidth
// const ipad = false // navigator.userAgent.match(/(iPad)/i) || oWidth > 600 // 判断Ipad

// function setRem(pwidth, prem) {
//   const html = document.getElementsByTagName('html')[0]
//   html.style.fontSize = (oWidth / pwidth) * prem + 'px'
// }

// // 初始化
// setRem(ipad ? oWidth === 930 : 375, 16)
// // 改变窗口大小时重新设置 rem
// window.onresize = function () {
//   setRem(ipad ? oWidth === 930 : 375, 16)
// }

const baseSize = 16 // 基准值
function setRem() {
  let clientWidth = document.documentElement.clientWidth
  let scale = 1
  if (clientWidth <= 375) {
    clientWidth = 375
  } else if (clientWidth <= 700) { // 第三版要求超过700px，两边空白，居中显示(特殊要求)
    // clientWidth = 375
  } else if (clientWidth <= 750) { // 第二版超过750px，两边空白，居中显示
    clientWidth = 375
  } else if (clientWidth <= 1024) { // 第一版超过1024px，两边空白，居中显示
    clientWidth = 375
  } else if (clientWidth <= 1200) {
    clientWidth = 375
  } else if (clientWidth > 1200) {
    clientWidth = 375
  }
  // 相对于375像素的缩放比
  scale = clientWidth / 375
  // 根据屏幕变化 1rem 对应的 font-size
  const realFont = baseSize * scale
  document.documentElement.style.fontSize = realFont + 'px'
}
setRem()
window.addEventListener('resize', () => {
  setRem()
})
