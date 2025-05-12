export const getCurrentX = (a, b) => {
  let currentXIndex = 0
  let startValue = ''
  let endValue = ''

  if (b) {
    currentXIndex = a?.findIndex((item) => item === b)
    if (a?.length >= 6) {
      if (currentXIndex === a?.length - 1) {
        startValue = a[currentXIndex - 4]
        endValue = a[currentXIndex]
      } else if (a?.length - currentXIndex < 5) {
        startValue = a[currentXIndex - 2]
        endValue = a[a?.length - 1]
      } else {
        if (currentXIndex < 3) {
          startValue = a[0]
          endValue = a[5]
          currentXIndex = 2
        } else {
          startValue = a[currentXIndex - 2]
          endValue = a[currentXIndex + 2]
        }
      }
      return { currentXIndex, startValue, endValue }
    } else {
      return { currentXIndex: 0, startValue: a && a[0], endValue: null }
    }
  } else {
    return {
      currentXIndex: a?.length > 2 ? 2 : 0,
      startValue: null,
      endValue: null
    }
  }
}

export const getCurrentXIpad = (a, b, e) => {
  let currentXIndex = 0
  let startValue = ''
  let endValue = ''
  let eNum = 12
  if (e) eNum = e
  if (b) {
    currentXIndex = a?.findIndex((item) => item === b)
    if (a?.length >= eNum) {
      if (currentXIndex === a?.length - 1) {
        startValue = a[currentXIndex - 11]
        endValue = a[currentXIndex]
      } else if (a?.length - currentXIndex < eNum) {
        startValue = a[currentXIndex - eNum]
        endValue = a[a?.length - 1]
      } else {
        if (currentXIndex < 6) {
          startValue = a[0]
          endValue = a[eNum]
          currentXIndex = 6
        } else {
          startValue = a[currentXIndex - 11]
          endValue = a[currentXIndex + 11]
        }
      }
      // console.log(1, {currentXIndex, startValue, endValue})
      return { currentXIndex, startValue, endValue }
    } else {
      // console.log(2, {currentXIndex: 0, startValue: a && a[0], endValue: null})
      return { currentXIndex: 0, startValue: a && a[0], endValue: null }
    }
  } else {
    // console.log(3, {currentXIndex: a?.length > 11 ? 6 : Math.floor(a?.length/2) || 0, startValue: null, endValue: null})
    return {
      currentXIndex: a?.length > 11 ? 6 : Math.floor(a?.length / 2) || 0,
      startValue: null,
      endValue: null
    }
    // return {currentXIndex: a?.length > 2 ? 2 : 0, startValue: null, endValue: null}
  }
}

// 判断时间格式
export const isDateType = (res) => {
  return Object.prototype.toString.call(res) === '[object Date]'
}

// 最大值
export const getMax = (res) => {
  return res
}

export function fontSizeRem (res) {
  // 获取文档宽度
  /* const docEl = document.documentElement
  const clientWidth = window.innerWeight ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
  // 未获取到宽度 返回undefined
  if (!clientWidth) return
  // 根据文档宽度和设计稿的宽度 获取单位转换比例
  let fontSize = 16
  if(clientWidth >=900) {
     fontSize = clientWidth / (clientWidth + 100)
  }else {
     fontSize = clientWidth / 930

  } */
  // 返回大小
  return res // res * fontSize
}

export function px2rem (px) {
  if (/%/gi.test(px)) {
    // 有百分号%，特殊处理，表述pc是一个有百分号的数，比如：90%
    return px
  } else {
    return parseFloat(px) / 16 + 'rem'
  }
}

export function rem2px (rem) {
  if (!rem) return 0
  let rootSize = document.documentElement.style.fontSize
  let rootSizeNum = parseFloat(rootSize)
  let remNum = parseFloat(rem)
  return remNum * rootSizeNum
}

// 只适用pad设置table width
export function tableWidth (width) {
  const oWidth =
    document.body.clientWidth || document.documentElement.clientWidth
  if (!oWidth) {
    return width
  }
  // 此处930 根据rem.js设置的930
  return (width * oWidth) / 930
}

// 深拷贝
export function deepClone (target) {
  // 定义一个变量
  let result
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
    // 如果是一个数组的话
    if (Array.isArray(target)) {
      result = [] // 将result赋值为一个数组，并且执行遍历
      for (const i in target) {
        // 递归克隆数组中的每一项
        result.push(deepClone(target[i]))
      }
      // 判断如果当前的值是null的话；直接赋值为null
    } else if (target === null) {
      result = null
      // 判断如果当前的值是一个RegExp对象的话，直接赋值
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      // 否则是普通对象，直接for in循环，递归赋值对象的所有值
      result = {}
      for (const i in target) {
        result[i] = deepClone(target[i])
      }
    }
    // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
    result = target
  }
  // 返回最终结果
  return result
}

// 退出app
export function exitApp () {
  sessionStorage.clear()
  localStorage.clear()
  window.h5sdk?.biz?.navigation?.close({
    onSuccess: function (result) {
    }
  })
}

// 过滤对象空值
export function removeNull (data) {
  const newData = {}
  for (const key in data) {
    if (
      (data[key] &&
        data[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== '') ||
      data[key] === 0
    ) {
      newData[key] = data[key]
    }
  }
  return newData
}

/**
 * 保留两位有效数字
 * 1、当小数点后超过两位时，四舍五入保留两位小数 === 改纵坐标取值尽量为整数，如不能为整数，保留一位小数即可
 * 2、当小数点后低于两位时，维持现状无需填充0
 */
export function diyToFixed (value, number) {
  if (number === undefined) number = 1
  let copyValue = value.toString()
  try {
    let arr = copyValue.split('.')
    if (arr[1] !== undefined && arr[1].length > 1) {
      value = value.toFixed(number)
    }
  } catch (error) {
    console.log('error:', error)
  }
  return value
}

// 给数字添加 k w 单位
export function addKW (value, number, max, isUnit = true) {
  if (value === 0) return 0
  if (max >= 1e3 && max < 1e4) {
    let num = diyToFixed((value / 1e3), number)
    return parseFloat(num).toString() + (isUnit ? 'k' : '')
  } else if (max >= 1e4) {
    let num = diyToFixed((value / 1e4), number)
    return parseFloat(num).toString() + (isUnit ? 'w' : '')
  } else {
    return value
  }
}

// 数值转换为万
export function numParse(value) {
  if (!value) return 0
  let num = parseFloat((value / 1e4))
  let arr = num.toString().split('.')
  if (arr && arr[1]) {
    return arr[0]
  }
  return num
}
// 数值千分位
export function numThousand(num) {
  if (num === 0) return 0
  if (num === undefined || num === null || num === '') return '--'
  let sign = num < 0 ? '-' : ''
  num = Math.abs(num)
  num=num.toString().split(".");  // 分隔小数点
  var arr=num[0].split("").reverse();  // 转换成字符数组并且倒序排列
  var res=[];
  for(var i=0,len=arr.length;i<len;i++){
    if(i%3===0&&i!==0){
       res.push(",");   // 添加分隔符
    }
    res.push(arr[i]);
  }
  res.reverse(); // 再次倒序成为正确的顺序
  if(num[1]){  // 如果有小数的话添加小数部分
    res=res.join("").concat("."+num[1]);
  }else{
    res=res.join("");
  }
  return sign + res;
}
export function formatDate(dateTime, fmtStr) {
  if (!dateTime) return ''
  if (Object.prototype.toString.call(dateTime) === '[object String]') {
    dateTime = dateTime.replace(/-/g, '/')
  } else if (Object.prototype.toString.call(dateTime) === '[object Date]') {
  } else {
    return ''
  }
  const date = new Date(dateTime)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  if (fmtStr) {
    return `${year}${fmtStr}${month}${fmtStr}${day}`;
  }
  return `${year}年${month}月${day}日`;
}

// 获取?后面参数
export const getUrlParams = url => {
  if (!url) return {}
  let obj = {}
  let arr1 = url.split('?')
  for (let i = 0, length = arr1.length; i < length; i++) {
    let str = arr1[i]
    let arr2 = str.split('&')
    for (let j = 0, length = arr2.length; j < length; j++) {
      let item = arr2[j].split('=')
      if (item && item[0] && item[1]) {
        obj[item[0]] = item[1]
      }
    }
  }
  return obj
}

export const isPCBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // 判断是否为平板电脑
  // 注意：这里只是判断了一些常见的平板用户代理标识，可能并不全面
  const isTablet =
    /iPad|PlayBook|Silk/.test(userAgent) ||
    (/Android/i.test(userAgent) &&
      !/Mobile/.test(userAgent) &&
      window.innerWidth > 480 &&
      window.innerHeight > 640);

  // 判断是否为移动设备（手机等）
  // 注意：这里会排除掉已经判断为平板的情况
  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    ) && !isTablet;

  // 默认情况下认为是PC（桌面设备）
  const isPC = !isMobile && !isTablet;

  if (isPC) {
    // console.log("当前设备类型:", "PC");
  } else if (isTablet) {
    // console.log("当前设备类型:", "Tablet");
  } else if (isMobile) {
    // console.log("当前设备类型:", "Mobile");
  } else {
    // 如果无法确定设备类型，可以返回一个默认值或者进一步处理
    // console.log("当前设备类型:", "Unknown");
  }
  return isPC
}

export const formatMilliseconds = (ms, showH = true, fmtStr = 'cn') => {
  if (ms === null || ms === undefined || ms === '') {
    return ''
  }
  // let sign = ms < 0 ? '-' : '';
  ms = Math.abs(ms)

  // 计算总秒数
  const totalSeconds = Math.floor(ms / 1000);

  // 计算小时数
  const hours = Math.floor(totalSeconds / 3600);

  // 计算剩余的分钟数
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  // 计算剩余的秒数
  const seconds = totalSeconds % 60;

  const fmpMap = {
    cn: {
      hourStr: '时',
      minStr: '分',
      sStr: '秒',
    },
    en: {
      hourStr: 'h',
      minStr: 'm',
      sStr: 's',
    }
  }
  const hourStr = fmpMap[fmtStr].hourStr
  const minStr = fmpMap[fmtStr].minStr
  const sStr = fmpMap[fmtStr].sStr
  // 返回格式化的字符串
  // return `${String(hours).padStart(2, '0')}小时${String(minutes).padStart(2, '0')}分${String(seconds).padStart(2, '0')}秒`;
  if (!showH) {
    return `${String(minutes)}${minStr}${String(seconds)}${sStr}`;
  }
  return `${String(hours)}${hourStr}${String(minutes)}${minStr}${String(seconds)}${sStr}`;
}

export const moveItemToPlace = (arr, index, place = 'end') => {
  // 检查索引是否在有效范围内
  if (index < 0 || index >= arr.length) {
    return arr; // 或者你可以抛出一个错误
  }

  // 使用 splice 从数组中移除项，并获取该项
  const item = arr.splice(index, 1)[0];

  if (place === 'start') {
    // 使用 push 将该项添加到数组的开头
    arr.unshift(item);
  } else if (place === 'end') {
    // 使用 push 将该项添加到数组的末尾
    arr.push(item);
  }
  return arr;
}

// 菜单树字段映射
export const convertTree = (treeData, idField, labelField, valueField) => {
  const result = []
  treeData = treeData || []
  // 遍历 treeData
  treeData.forEach((item) => {
    // 解构赋值
    let {
      [idField]: id,
      [labelField]: name,
      [valueField]: value,
      children: children,
      ...rest
    } = item

    // 如果有子节点，递归
    if (children) {
      children = convertTree(children, idField, labelField, valueField)
    }

    result.push({
      ...rest,
      id,
      name,
      value,
      children
    })
  })

  return result
}

// 菜单树添加层级
export const addFieldToNodes = (nodes, level = 1) => {
  for (let node of nodes) {
    node.level = level; // 添加 level
    if (node.children && node.children.length > 0) { // 如果节点有子节点，递归调用
      addFieldToNodes(node.children, level + 1);
    }
  }
  return nodes
};

// 菜单树添加唯一字段标识
export const addIdToNodes = (nodes, field = 'id') => {
  for (let node of nodes) {
    node[field] = Math.random().toString(36) // 添加唯一字段标识
    if (node.children && node.children.length > 0) { // 如果节点有子节点，递归调用
      addFieldToNodes(node.children, field);
    }
  }
  return nodes
};

// 菜单级联树截取到某一级
export const runeMenuTree = (nodes, levelToStop) => {
  function pruneLevel(nodes, level) {
    for (let node of nodes) {
      if (level < levelToStop) {
        if (node.children) {
          pruneLevel(node.children, level + 1);
        }
      } else {
        delete node.children;
      }
    }
  }
 
  pruneLevel(nodes, 1);
  return nodes
}

// 根据id返回节点
export const findNodeById = (nodes, targetField, field = 'id') => {
  for (let node of nodes) {
    if (node[field] === targetField) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const result = findNodeById(node.children, targetField, field);
      if (result) {
        return result;
      }
    }
  }
  return null; // 如果没有找到，返回 null
};

// 查找树节点不超过Level的所有节点Id集合
export const getLimtNodeId = (nodes, limitLevel) => {
  console.log('nodes', nodes);
  let result = []
  const parse = (nodes, limitLevel) => {
    for (let node of nodes) {
      if (node.level <= limitLevel) {
        result.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        parse(node.children, limitLevel);
      }
    }
  }
  parse(nodes, limitLevel)
  return result
}

/**
 * 根据树子节点ID查找所有父节点ID
 * @param {*} data 树形结构数据源
 * @param {*} targetId 子节点ID
 * @param {*} fieldType 返回结果集合类型：id/name
 * @returns {String} 包含所有父节点name用【/】拼接，按照从根节点到直接父节点的顺序排序
 */
export const findNodePath = (data, targetId, fieldType = 'name') => {
  let result = []
  let ids = []
  // data：要遍历的数据， target：查找目标， result用于装查找结果的数组
  const traverse = (data, targetId) => {
    for (let item of data) {
      if (item.id === targetId) {
        // 将查找到的目标数据加入结果数组中
        // 可根据需求unshift(item.id)或unshift(item)
        result.unshift(item.name)
        ids.unshift(item.id)
        return true
      }
      if (item.children && item.children.length > 0) {
        // 根据查找到的结果往上找父级节点
        let isFind = traverse(item.children, targetId)
        if (isFind) {
          result.unshift(item.name)
          ids.unshift(item.id)
          return true
        }
      }
    }
    // 走到这说明没找到目标
    return false
  }
  traverse(data, targetId)
  if (fieldType === 'id') {
    return ids
  }
  return result.join('【/】')
}

