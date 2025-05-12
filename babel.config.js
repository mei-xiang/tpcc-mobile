module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'entry', // or "usage"
      corejs: 3
    }]
    /* '@vue/cli-plugin-babel/preset',
    [
      '@vue/app',
      {
        useBuiltIns: 'entry',
        polyfills: [
          'es6.promise',
          'es6.symbol'
        ],
        corejs:3,
      }
    ] */
  ],
  plugins: ['lodash', 'equire'],
  env: {
    dev: {
      plugins: ['dynamic-import-node']
    }
  }
}
