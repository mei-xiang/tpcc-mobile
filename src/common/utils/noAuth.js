
import { createApp } from 'vue'
// 导入写好的Loading.vue文件
import Noauth from '@/components/Noauth'

export default {
  noAuth: null,
  // 每当这个插件被添加到应用程序中时，如果它是一个对象，就会调用 install 方法。如果它是一个 function，则函数本身将被调用。在这两种情况下——它都会收到两个参数：由 Vue 的 createApp 生成的 app 对象和用户传入的选项。
  install (app) {
    if (this.loading) {
      // 防止多次载入
      app.config.globalProperties.$noAuth = this.noAuth
      return
    }
    // 创建实例，用于挂载
    const instance = createApp(Noauth)
    // 创建div元素装载对象
    const div = document.createElement('div')
    const body = document.body
    // 导入body中
    body.appendChild(div)
    this.noAuth = instance.mount(div)
    // 挂载vue身上
    app.config.globalProperties.$noAuth = this.noAuth
  }
}
