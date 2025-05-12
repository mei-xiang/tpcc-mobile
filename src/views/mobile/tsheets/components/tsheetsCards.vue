<template>
  <van-form class="card-wrap"  :class="{'no-input': filledHours === 0}" ref="formRef" @failed="onFailed" @submit="submit">
    <Collapse
      class="card-item"
      v-for="(i, index) in info"
      :key="index"
      default-open
    >
      <template #title>
        <div class="title-day">
          <div class="title-sys">
            {{ i.spfSysInfoName }}
          </div>
          <div class="title-item-day">{{ i.number || "--" }}天</div>
        </div>
      </template>

      <van-cell-group>
        <van-field
          :disabled="disabled"
          v-model="i.workingTypeName"
          is-link
          readonly
          name="picker"
          label="工时类型"
          required
          placeholder="请选择工时类型"
          :rules="[{ required: true, message: '请选择工时类型' }]"
          @click="handField('workingType', index)"
        >
          <template #label>
            <span @click.stop="showTips = true">工时类型</span>
            <img
              @click.stop="showTips = true"
              class="working-type-label-img"
              :src="require('@/assets/images/icon-info.svg')"
              alt=""
              srcset=""
            />
          </template>
        </van-field>
        <van-field
          :disabled="disabled || i.workingType === 4"
          v-model="i.spfSysInfoName"
          is-link
          readonly
          name="picker"
          label="系统名称"
          placeholder="请选择系统名称"
          :rules="[{ required: true, message: '请选择系统名称' }]"
          required
          @click="handField('spfSysInfoCode', index)"
        >
        <template #input v-if="tagText(i.spfSysInfoName) === '已下线'">
          <div :class="{disabledStyle:disabled  || i.workingType === 4}">
            <span>{{ i.spfSysInfoName }}&nbsp;</span>
            <van-tag color="#ffe1e1" text-color="#ad0000" >已下线</van-tag>
          </div>
        </template>
        </van-field>
        <van-field
          :disabled="disabled  || i.workingType === 4"
          v-model="i.projectName"
          is-link
          readonly
          name="picker"
          label="所属项目"
          required
          placeholder="请选择所属项目"
          :rules="[{ required: true, message: '请选择所属项目' }]"
          @click="handField('projectId', index)"
        />
        <!-- 允许输入数字，调起带符号的纯数字键盘 -->
        <van-field
          :disabled="disabled"
          v-model="i.number"
          type="number"
          label="天数"
          required
          clearable
          placeholder="请输入天数"
          @blur="calculateDay"
          @clear="calculateDay"
          @input="
            (val) => {
              i.number = inputCheckout(i.number);
            }
          "
          :rules="rulesDay()"
        />
        <!-- <van-field
          :disabled="disabled"
          v-model="i.content"
          autosize
          type="textarea"
          maxlength="400"
          label="工作内容"
          placeholder="请输入工作内容"
          show-word-limit
          clearable
        /> -->
      </van-cell-group>

      <div class="button-wrap">
        <van-button type="danger" :disabled="disabled" plain size="small" @click="handDel(index)"
          >删除</van-button
        >
        <van-button
          color="#526AE7"
          plain
          :disabled="disabled"
          size="small"
          @click="handCopy(index, i)"
          >复制</van-button
        >
      </div>
    </Collapse>
    <div class='add-bar'>
      <van-floating-bubble
        v-model:offset="offset"
        axis="xy"
        icon="plus"
        magnetic="x"
        @click="handAdd"
        class="ts-ball"
        :class="{'ts-ball-isabled':disabled}"
      />
      <!-- <van-button :disabled="disabled" color="#526AE7" size="normal" icon="plus" @click="handAdd">新增</van-button> -->
    </div>
  </van-form>
  <!-- 所属系统搜索 -->
  <SearchIndex
  :visible="popup.sys.visible"
  @update:visible="(val)=>{
    popup.sys.visible = val
  }"
  :list="popup.sys.pickerColumns"
  :prop="{label:'sysName',children:'projectOfSysList'}"
  @handItem="onConfirmSys"
  >
<template #listTop>
  <!-- <van-index-anchor index="常用"/> -->
  <van-cell :title="popup.sys.pickerColumns[0]?.sysName" @click="onConfirmSys(popup.sys.pickerColumns[0])" />
</template>
<template #itemTag="{item}">
  &nbsp;
  <van-tag color="#ffe1e1" v-if="item.status === '已下线'" text-color="#ad0000">{{ item.status }}</van-tag>
</template>
</SearchIndex>
  <!-- 所属项目搜索 -->
  <SearchIndex
  :visible="popup.project.visible"
  @update:visible="(val)=>{
    popup.project.visible = val
  }"
  :isSort="false"
  :list="popup.project.pickerColumns"
  :prop="{label:'projectName',children:'projectOfSysList'}"
  @handItem="onConfirmProject"
  ></SearchIndex>
  <!-- 所属项目 -->
  <!-- <van-popup
    v-model:show="popup.project.visible"
    position="bottom"
    teleport="#app"
    safe-area-inset-bottom
  >
    <van-picker
      v-if="popup.project.visible"
      v-model="popup.project.pickerValue"
      :columns="popup.project.pickerColumns"
      :columns-field-names="{ text: 'projectName', value: 'projectId' }"
      @confirm="onConfirmProject"
      :title="popup.project.pickerTitle"
      @cancel="popup.project.visible = false"
    />
  </van-popup> -->
  <!-- 工时类型 -->
  <van-popup
    v-model:show="popup.workingType.visible"
    position="bottom"
    teleport="#app"
    safe-area-inset-bottom
  >
    <van-picker
      v-if="popup.workingType.visible"
      v-model="popup.workingType.pickerValue"
      :columns="popup.workingType.pickerColumns"
      :columns-field-names="{ text: 'label', value: 'value' }"
      @confirm="onConfirmworkingType"
      :title="popup.workingType.pickerTitle"
      @cancel="popup.workingType.visible = false"
    />
  </van-popup>

  <van-dialog v-model:show="showTips" title="工时类型填写说明">
    <div class="tips-main">
      【研发】：研发活动可以包括项目需求分析、设计开发、测试等。
      <br /><br />【运维】：后期系统上线后的运维与优化工作（对现有产品、服务、技术、流程进行的重复或简单改变及常规性升级）、软硬件维保工作、该运维项目的项目管理工作等。
      <br /><br />【综合管理】：前期的市场调研、满意度调研、参加部门培训工作、管理工作研究等。
    </div>
  </van-dialog>
</template>
<script setup>
import { ref, onMounted, reactive, nextTick, computed } from 'vue'
import { Collapse, SearchIndex } from '@/components/index'
import { getSysProjectInfoList } from '@/common/api/TSheets'
import { deepClone } from '@/common/utils/comm'
import { tsTypeOptions } from '../config/options'
import NP from 'number-precision'
import { showDialog, showNotify, showSuccessToast, showConfirmDialog, showFailToast } from 'vant'
import { debounce, sortBy, reverse } from 'lodash'
// import type from 'postcss-pxtorem/lib/type'
const defaultItem = {
  projectId: null,
  projectName: null,
  spfSysInfoCode: null,
  spfSysInfoName: null,
  workingType: null,
  number: null,
  content: null,
  projectOptions: []
}

onMounted(() => {
  // getSysProjectOptions()
  // defaultOffset()
})

const tagText = (str) => {
  if (!str) return false
  const obj = popup.sys.pickerColumns.find(i => {
    return i.sysName === str
  })
  if (obj) {
    return obj.status
  } else {
    return false
  }
}

const emit = defineEmits(['update:day', 'submit', 'scrollToBottom'])
const props = defineProps({
  day: {
    type: Number,
    default: 0
  },
  workInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  filledHours: {
    type: Number,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false,
    required: true
  },
})
// 几圈球的位置
const defaultOffset = () => {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth ||
 document.body.clientWidth
  const screenHeight = window.innerHeight || document.documentElement.clientHeight ||
  document.body.clientHeight
  return {
    x: screenWidth - 24 - 50,
    y: screenHeight - 24 - 100
  }
}
const offset = ref(defaultOffset())
const showTips = ref(false)
// init
const info = ref([])
const init = async (list = []) => {
  console.log('list:::', list)
  if (list.length === 0) {
    list = [deepClone(defaultItem)]
  }
  info.value = list
  
  await generateProjectOptions(deepClone(list))
  calculateDay()
}
const generateProjectOptions = async (list, again = false) => {
  let sysProjectOptions = sessionStorage.getItem('sysProjectOptions')
  if (sysProjectOptions === null && !again) {
    await getSysProjectOptions()
    await generateProjectOptions(list, true)
    return
  }
  sysProjectOptions = JSON.parse(sysProjectOptions)
  list.forEach((i) => {
    const obj = sysProjectOptions.find((s) => {
      return s.sysCode === i.spfSysInfoCode
    })
    i.projectOptions = obj?.projectOfSysList || []
    // 针对后台没返回projectName前端来返查找
    // const objProject = obj?.projectOfSysList.find((s) => {
    //   return s.projectId === i.projectId
    // })
    // i.projectName = objProject?.projectName || ''
    // 针对后台没返回projectName前端来返查 end
    // 工时类型反查
    const workingTypeObj = tsTypeOptions.find((s) => {
      return s.value == i.workingType
    })
    i.workingTypeName = workingTypeObj?.label || ''
  })
  info.value = list
  return list
}

const popup = reactive({
  sys: {
    popupVisible: false,
    pickerTitle: null,
    pickerValue: null,
    pickerColumns: JSON.parse(
      sessionStorage.getItem('sysProjectOptions') || '[]'
    )
  },
  project: {
    popupVisible: false,
    pickerTitle: null,
    pickerValue: null,
    pickerColumns: []
  },
  workingType: {
    popupVisible: false,
    pickerTitle: null,
    pickerValue: null,
    pickerColumns: tsTypeOptions
  }
})
// 获取系统项目options
// const sysProjectOptions = ref([])

const getSysProjectOptions = async () => {
  let params = {}
  // 1-已填写 2-未填写
  if (props.workInfo.status === 1) {
    params.workingHoursId = props.workInfo.id
  }
  await getSysProjectInfoList(params)
    .then(async (res) => {
      if (res.code === 200) {
        // 过滤后台传过来不靠谱数据
        const filterData = res.data.filter((i) => {
          return i.sysCode && i.sysName
        })
        // filterData[0].sysName = 'AAA' + filterData[0].sysName
        popup.sys.pickerColumns = filterData
        await sessionStorage.setItem(
          'sysProjectOptions',
          JSON.stringify(filterData)
        )
      }
    })
    .catch((err) => {
      console.log('err:', err)
    })
}
// 哪一个卡片弹出的popup
const popupIndex = ref(null)
// 点击选择框弹出 pop
const handField = (key, index) => {
  if (props.disabled) {
    return
  }

  if (['spfSysInfoCode', 'projectId'].includes(key) && info.value[index].workingType === 4) {
    return
  }

  popupIndex.value = index
  if (key === 'spfSysInfoCode') {
    popup.sys.pickerValue = [info.value[index].spfSysInfoCode]
    popup.sys.pickerTitle = info.value[index].spfSysInfoName
    popup.sys.visible = true
  } else if (key === 'projectId') {
    popup.project.pickerValue = [info.value[index].projectId]
    popup.project.pickerTitle = info.value[index].projectName
    popup.project.pickerColumns = info.value[index].projectOptions
    popup.project.visible = true
  } else if (key === 'workingType') {
    popup.workingType.pickerValue = [info.value[index].workingType]
    popup.workingType.pickerTitle = info.value[index].workingTypeName
    popup.workingType.visible = true
  }
}
const onConfirmSys = (item) => {
  info.value[popupIndex.value].spfSysInfoCode = item.sysCode
  info.value[popupIndex.value].spfSysInfoName = item.sysName
  info.value[popupIndex.value].projectId = null
  info.value[popupIndex.value].projectName = null
  info.value[popupIndex.value].projectOptions = item.projectOfSysList
  popup.sys.visible = false
  // commonlyUsedSys(item)
  // commonlyUsedSysNumber(item)
}

// // 常用系统统计
// const commonlyUsedSys = (item) => {
//   let usedSys = localStorage.getItem('usedSys') || '[]'
//   usedSys = JSON.parse(usedSys)
//   if (usedSys.length === 0) {
//     usedSys.push(popup.sys.pickerColumns[0])
//   }
//   usedSys.push(item)
// }
// // 统计点击次数
// const commonlyUsedSysNumber = (item) => {
//   let usedSysNumber = localStorage.getItem('usedSysNumber') || '[]'
//   usedSysNumber = JSON.parse(usedSysNumber)
//   if (usedSysNumber.length === 0) {
//     usedSysNumber.push({
//       ...popup.sys.pickerColumns[0],
//       clickNum: 1
//     })
//   }
//   const obj = usedSysNumber.find(i => {
//     return i.sysCode === item.sysCode
//   })
//   if (obj) { obj.clickNum = obj.clickNum + 1 } else {
//     usedSysNumber.push({
//       ...item,
//       clickNum: 1
//     })
//   }
//   usedSysNumber = sortByKey(usedSysNumber, 'clickNum')
//   usedSysNumber = usedSysNumber.slice(0, 5)
//   usedSysNumber = JSON.stringify(usedSysNumber)
//   localStorage.setItem('usedSysNumber', usedSysNumber)
// }

// // 降序
// const sortByKey = (array, key) => {
//   return array.sort(function (a, b) {
//     return b[key] - a[key]
//   })
// }

const onConfirmProject = (item) => {
  info.value[popupIndex.value].projectId = item.projectId
  info.value[popupIndex.value].projectName = item.projectName
  popup.project.visible = false
}
const onConfirmworkingType = ({ selectedOptions }) => {
  info.value[popupIndex.value].workingType = selectedOptions[0].value
  info.value[popupIndex.value].workingTypeName = selectedOptions[0].label
  if (selectedOptions[0].value === 4) {
    // 工时类型为休假时
    info.value[popupIndex.value].spfSysInfoName = '其他'
    info.value[popupIndex.value].spfSysInfoCode = '-1'
    info.value[popupIndex.value].projectId = -1
    info.value[popupIndex.value].projectName = '其他'
    let sysProjectOptions = sessionStorage.getItem('sysProjectOptions') || '[]'
    sysProjectOptions = JSON.parse(sysProjectOptions)
    const optionsObj = sysProjectOptions.find(i => {
      return i.sysCode === '-1'
    })
    if (optionsObj) {
      info.value[popupIndex.value].projectOptions = optionsObj.projectOfSysList
    }
  }
  popup.workingType.visible = false
}

const rulesDay = () => {
  let rulesArr = []
  if (props.workInfo.isConsistent === 0) {
    rulesArr = [
      { required: true, message: '请输入天数' },
      { validator: numberCheckout_4, message: '天数需大于或等于0' },
      { validator: numberCheckout_2, message: '最多保留一位小数' },
      { validator: numberCheckout_5, message: '已填工时不能超过本周期最大天数' }
    ]
  } else {
    rulesArr = [
      { required: true, message: '请输入天数' },
      { validator: numberCheckout_1, message: '天数需大于0' },
      { validator: numberCheckout_2, message: '最多保留一位小数' },
      { validator: numberCheckout_3, message: '已填写工时不能大于应填写工时' }
    ]
  }
  return rulesArr
}
const numberCheckout_1 = (val) => {
  return val > 0
}
const numberCheckout_2 = (val) => {
  const str = val + ''
  const reg = /^\d+(\.\d{1})?$/
  return reg.test(str)
}
const numberCheckout_3 = (val) => {
  const day = calculateDay()
  return props.filledHours >= day
}
const numberCheckout_4 = (val) => {
  return val >= 0
}
const numberCheckout_5 = (val) => {
  const day = calculateDay()
  return day <= props.workInfo.cycleMaxDayNumber
}

const handDel = (index) => {
  if (info.value.length === 1) {
    return
  }

  showConfirmDialog({
    title: '提醒',
    message:
    '确定删除当前记录?'
  })
    .then(() => {
      info.value.splice(index, 1)
      showSuccessToast('操作成功')
      calculateDay()
    })
    .catch(() => {
    // on cancel
    })
}
// 点击复制按钮
const handCopy = debounce((index, item) => {
  info.value.splice(index, 0, deepClone(item))
  showNotify({ type: 'success', message: '复制成功', duration: 1500 })
  calculateDay()
}, 2000, { leading: true, trailing: false })
// 点击新增按钮
const handAdd = debounce(() => {
  if (props.disabled) {
    return false
  }
  info.value.push(deepClone(defaultItem))
  showNotify({ type: 'success', message: '操作成功', duration: 1500 })
  calculateDay()
  nextTick(() => {
    emit('scrollToBottom')
  })
}, 2000, { leading: true, trailing: false })
const calculateDay = () => {
  const dayArr = info.value.map((i) => {
    return i.number ? i.number : 0
  })
  const day = dayArr.reduce(function (prev, cur, index, arr) {
    return NP.plus(prev, cur)
  })
  emit('update:day', day)
  return day
}
// 天数输入时校验
const inputCheckout = (res) => {
  const len1 = res.substr(0, 1)
  if (len1 === '-' || len1 === '.') {
    return ''
  }
  if (len1 === '0' && res.substr(1, 1) !== '.') {
    return '0'
  }
  const lastStr = res.split('.')[1]
  if (lastStr) {
    return res.split('.')[0] + '.' + lastStr.substr(0, 1)
  }
  return res
}
// checkoutAll
const formRef = ref()
const checkoutAll = () => {
  formRef.value?.submit()
}
const onFailed = (err) => {
  console.log('err', err)
  const checkoutDate = err.errors.every(i => {
    return i.message === '已填写工时不能大于应填写工时'
  })
  const checkoutDate1 = err.errors.every(i => {
    return i.message === '已填工时不能超过本周期最大天数'
  })
  if (checkoutDate) {
    showNotify({ type: 'warning', message: '已填天数不能超过应填天数' })
    return
  }
  if (checkoutDate1) {
    showNotify({ type: 'warning', message: '已填工时不能超过本周期最大天数' })
    return
  }
  showNotify({ type: 'warning', message: '存在必填项未填写' })
}
const submit = async(res) => {
  const day = calculateDay()

  console.log(day, props.workInfo.filledHours)
  let noPass = false
  if (props.workInfo.isConsistent === 1 && props.filledHours > day) {
    showNotify({ type: 'warning', message: '已填工时不等于应填工时，请修改后再提交' })
    return
  }
  if (props.workInfo.isConsistent === 0 && day != props.workInfo.filledHours) {
    noPass = await showConfirmDialog({
      title: '提醒',
      message: '已填工时与应填工时不一致，是否继续提交?'
    })
      .then(() => {
        return false
      })
      .catch(() => {
        return true
      })
  }
  if (noPass) return

  const detailsList = deepClone(info.value)
  detailsList.forEach(i => {
    delete i.projectOptions
    delete i.assetEntityContractCode
    delete i.assetEntityContractName
    delete i.createBy
    delete i.createTime
    delete i.searchKey
    delete i.updateTime
    delete i.updateBy
    delete i.workingHoursId
    delete i.isDel
    delete i.deptid
    delete i.id
    i.number = Number(i.number)
  })
  emit('submit', detailsList)
}
defineExpose({ init, checkoutAll, info })
</script>
<style lang="less" scoped>
.card-wrap {
  font-size: 13px;
  .card-item {
    // margin: 0 -16px;
    margin-bottom: 20px;
    :deep(.collapse-main) {
      margin: 0 -16px;
    }
  }

  .title-day {
    display: flex;
    align-items: center;

    .title-sys {
      max-width: 200px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      font-size: 16px;
      font-weight: 500;
    }

    .title-item-day {
      margin-left: 30px;
      font-size: 16px;
    }
  }

  .van-hairline--top-bottom:after {
    border-top: none;
  }
  .working-type-label-img {
    width: 14px;
    height: 14px;
    overflow: hidden;
    margin-left: 4px;
    position: relative;
    top: 2px;
  }
}
.tips-main {
  padding: 16px;
  color: #455467;
  font-size: 13px;
}
.button-wrap {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  > button {
    width: 40%;
  }
  // > div {
  //   flex: 1;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   height: 32px;
  //   box-sizing: border-box;
  //   font-size: 13px;
  //   &:nth-child(1) {
  //     border-right: 1px soild var(--van-cell-border-color);
  //   }
  // }

}
.add-bar{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  >button{
    background-color: rgba(0, 0, 0, 0);
    width: 220px;
  }

}
/deep/.van-field__label{
  color: var(--van-field-label-color) !important;
}
.disabledStyle{
    color: var(--van-field-input-disabled-text-color);
    cursor: not-allowed;
    opacity: 1;
}
</style>
<style lang="less">
.ts-ball{
  background-color: #526AE7;
  &.ts-ball-isabled{
    background-color: #c8c9cc;
  }
}
</style>
