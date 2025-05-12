import store from '../../../store'
export default (app) => {
  // 获取保存的菜单树
  app.directive('permission', {
    mounted (el, binding) {
      const menuTree = store.getters.getMenuTree || []
      if (binding.value) {
        // 如果菜单树对象中包含该key，则显示，反之则隐藏
        if (!menuTree?.some((item) => item === binding.value)) el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
}
