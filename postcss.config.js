// autoprefixer: {
//   overrideBrowserslist: [
//     'Android >= 4.0',
//     'iOS >= 8'
//     // 'Chrome > 40',
//     // 'ff > 30',
//     // 'ie >= 8'
//   ],
//     grid: true
// },

const pxtorem = require('postcss-pxtorem')
module.exports = {
  plugins: [
    pxtorem({
      rootValue: 16,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      maxPixelValue: 750 // 设置最大处理宽度为 750px
    })
  ]
}
