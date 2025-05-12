const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// 别名
const resolveAlias = config => {
  config.resolve.alias
    .set('@', resolve('src'))
    .set('assets', resolve('src/assets'))
    .set('api', resolve('src/common/api'))
    .set('view', resolve('src/view'))
    .set('components', resolve('src/components'))
}

// * 公共代码抽离
const optimization = config => {
  config
    .plugin('ScriptExtHtmlWebpackPlugin')
    .after('html')
    .use('script-ext-html-webpack-plugin', [{
      // 将 runtime 作为内联引入不单独存在
      inline: /runtime\..*\.js$/
    }])
    .end()
  config.optimization.splitChunks({
    chunks: 'all',
    cacheGroups: {
      // cacheGroups 下可以可以配置多个组，每个组根据test设置条件，符合test条件的模块
      commons: {
        name: 'chunk-commons',
        test: resolve('src/components'),
        minChunks: 3, //  被至少用三次以上打包分离
        priority: 5, // 优先级
        reuseExistingChunk: true // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
      },
      node_vendors: {
        name: 'chunk-libs',
        chunks: 'initial', // 只打包初始时依赖的第三方
        test: /[\\/]node_modules[\\/]/,
        priority: 10
      },
      vantUI: {
        name: 'chunk-vantUI', // 单独将 vantUI 拆包
        priority: 20, // 数字大权重到，满足多个 cacheGroups 的条件时候分到权重高的
        test: /[\\/]node_modules[\\/]_?vant(.*)/
      }
    }
  })
  config.optimization.runtimeChunk('single')
}
// * 打包分析
const webpackReport = config => {
  config.plugin('webpack-openingProgress').use(BundleAnalyzerPlugin, [{
    analyzerMode: 'static'
  }])
}
// * 打包gzip
const assetsGzip = config => {
  config.plugin('compression-webpack-plugin').use(require('compression-webpack-plugin'), [{
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.html$|\.json$|\.css/,
    threshold: 10240, // 只有大小大于该值的资源会被处理 10240
    minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
    deleteOriginalAssets: true // 删除原文件
  }])
}
// * 代码压缩
const codeUglify = config => {
  config.plugin('uglifyjs-webpack-plugin').use(require('uglifyjs-webpack-plugin'), [{
    uglifyOptions: {
      // 生产环境自动删除console
      compress: {
        drop_debugger: true,
        drop_console: false,
        pure_funcs: ['console.log']
      }
    },
    sourceMap: false,
    parallel: true
  }])
}
// 图片压缩
const imgageUglify = config => {
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
    .use('image-webpack-loader')
    .loader('image-webpack-loader')
    .options({
      bypassOnDebug: true
    })
    .end()
}
module.exports = {
  resolveAlias,
  optimization,
  webpackReport,
  assetsGzip,
  codeUglify,
  imgageUglify
}
