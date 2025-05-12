<template>
<div class="search-index-wrap" v-show="visible">
  <van-sticky :offset-top="0">
    <van-nav-bar ref="navBar" class="search-index-top fixed-top-style" left-disabled safe-area-inset-top>
      <template #title>
        <van-search v-model="searchValue" placeholder="请输入搜索关键词" @update:model-value="handSearch" />
      </template>
      <template #right>
        <span class="quxiao-style" @click="handClose">取消</span>
      </template>
    </van-nav-bar>
  </van-sticky>
  <div class="search-index-main">
    <van-index-bar :index-list="indexList" v-if="!isSearch && isSort" highlight-color="#526AE7" :sticky-offset-top="offsetTop">
      <slot name="listTop"></slot>
      <template v-for="(val,key) in listIndex" :key="key">
        <van-index-anchor :index="key"/>
        <van-cell v-for="s in val" :title="s[prop.label]" :key="s[prop.label]" @click="handSysItem(s)" >
          <template #title>
            <span>{{s[prop.label]}}</span>
            <slot name="itemTag" :item="s"></slot>
          </template>
        </van-cell>
      </template>
    </van-index-bar>
    <van-index-bar :index-list="indexList" v-else-if="!isSearch && !isSort" highlight-color="#526AE7" :sticky-offset-top="offsetTop">
      <van-cell v-for="i in listIndex" :title="i[prop.label]" :key="i[prop.label]" @click="handSysItem(i)">
        <template #title>
          <span>{{i[prop.label]}}</span>
          <slot name="itemTag" :item="i"></slot>
        </template>
      </van-cell>
    </van-index-bar>
    <template v-else>
      <van-index-bar :index-list="[]" highlight-color="#526AE7">
        <template v-for="i in searchList" :key="i[prop.label]">
          <van-cell :title="i[prop.label]" @click="handSysItem(i)">
            <template #title>
              <span>{{i[prop.label]}}</span>
              <slot name="itemTag" :item="i"></slot>
            </template>
          </van-cell>
        </template>
      </van-index-bar>
      <van-empty v-if="searchList.length === 0" :description="'未找到 “'+ searchValue +'” 的相关结果'" />
    </template>
  </div>
</div>
</template>
<script setup>
import { watch, onMounted, ref, nextTick } from 'vue'
import { debounce, cloneDeep, filter } from 'lodash'
import pinyin from 'pinyin'
const props = defineProps({
  // collapse 标题
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  prop: {
    type: Object,
    default: () => {
      return {}
    }
  },
  visible: {
    type: Boolean,
    default: false
  },
  // 是否启用字母排序
  isSort: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:visible', 'handItem'])
watch(
  () => props.list,
  (res) => {
    getData(res)
  }
)
watch(
  () => props.visible,
  (res) => {
    searchList.value = []
    isSearch.value = false
    searchValue.value = ''
    if (res === true) {
      nextTick(() => {
        autoOffsetTop()
      })
    }
  }
)
onMounted(() => {
  getData(props.list)
})
// 搜索值
const searchValue = ref('')
// 列表
const listIndex = ref({})
// 排序顺序
const indexList = ref([])
// 列表数据备份
const cloneDeepList = ref([])
const getData = (list) => {
  if (!props.isSort) {
    // 不启用排序
    listIndex.value = list
    cloneDeepList.value = list
    return
  }
  const indexListObj = []
  const listIndexObj = {}
  list.map(i => {
    // i.pinyin = convertToPinyin(i[props.prop.label])
    let firstStr = i[props.prop.label].charAt(0)
    firstStr = pinyin(firstStr, { style: 'FIRST_LETTER' })
    firstStr = firstStr[0][0]
    firstStr = firstStr.toUpperCase()
    if (listIndexObj[firstStr]) {
      listIndexObj[firstStr].push(i)
    } else {
      listIndexObj[firstStr] = [i]
      indexListObj.push(firstStr)
    }
  })
  listIndex.value = objKeySort(listIndexObj)

  indexList.value = indexListObj.sort()
  sortListIndex()
}

// 搜索排序
const sortListIndex = () => {
  let cloneDeepListArr = []
  for (const key in listIndex.value) {
    cloneDeepListArr = cloneDeepListArr.concat(listIndex.value[key])
  }
  cloneDeepList.value = cloneDeepListArr
}

// 对象排序
const objKeySort = (arys) => {
  // 先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
  const newkey = Object.keys(arys).sort()
  // console.log('newkey='+newkey);
  const newObj = {} // 创建一个新的对象，用于存放排好序的键值对
  for (let i = 0; i < newkey.length; i++) {
    // 遍历newkey数组
    newObj[newkey[i]] = arys[newkey[i]]
    // 向新创建的对象中按照排好的顺序依次增加键值对
  }
  return newObj // 返回排好序的新对象
}

// 将中文转换为大写拼音
const convertToPinyin = (text) => {
  const pinyinArray = pinyin(text, { // 使用pinyin库将中文转换为拼音数组
    style: pinyin.STYLE_NORMAL
  })
  return pinyinArray.map(item => item[0]).join('').toUpperCase()// 将拼音数组转换为字符串
}

// 搜索出来的列表
const searchList = ref([])
// 是否展示搜索页面
const isSearch = ref(false)
// 搜索输入框输入时
const handSearch = debounce((val) => {
  val = val.replace(/\s+/g, '') // 过滤空格
  val = val.toUpperCase()
  if (!val) {
    searchList.value = []
    isSearch.value = false
    return
  }
  // val = convertToPinyin(val)
  const searchListObj = filter(cloneDeepList.value, (i) => {
    // return i.pinyin.indexOf(val) !== -1
    return i[props.prop.label].toUpperCase().indexOf(val) !== -1
  })
  searchList.value = searchListObj
  isSearch.value = true
}, 300)

// 点取消按钮
const handClose = () => {
  emit('update:visible', false)
}

// 选择
const handSysItem = (i) => {
  emit('handItem', i)
}

const navBar = ref(null)
const offsetTop = ref(46)
const autoOffsetTop = () => {
  offsetTop.value = navBar.value.$el.offsetHeight
}

</script>
<style lang="less" scoped>
.search-index-wrap{
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  top:0px;
  left: 0px;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  .search-index-top{
    /deep/.van-nav-bar__title{
      max-width: 100%;
      min-width: 76%;
    }
  }
  .search-index-main{
    padding: 16px 16px 30px 16px;
    padding-top: constant(safe-area-inset-top); /* 兼容 Safari */
    padding-top: env(safe-area-inset-top); /* 兼容其他浏览器 */
  }
  .quxiao-style{
    color: #526AE7;
  }
}
// 皮毛玻璃效果
.fixed-top-style{
    background-image: radial-gradient(transparent 1px,#ffffff 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(50%) blur(4px);
    background-color: rgba(0, 0, 0, 0);
}

/deep/.van-search{
  background-color: rgba(0, 0, 0, 0);
}
</style>
