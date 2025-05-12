<template>
  <van-dropdown-menu
    ref="menuRef"
    class="custom-dropdown-menu"
    :close-on-click-outside="false"
    :close-on-click-overlay="true"
  >
    <van-dropdown-item
      :title="checkName"
      ref="dropdownItemRef"
      @open="handleOpen"
      @close="handleClose"
    >
      <template #default>
        <van-radio-group v-model="chooseId" shape="dot">
          <div
            :class="['node-header', !$isPCBrowser ? 'mobile-node-header' : '']"
          >
            <span
              class="node-header-item"
              v-for="item in headerColumn"
              :style="{
                flex: !item.minWidth && !item.width ? 1 : 'none',
                minWidth: item.minWidth || 'auto',
                width: item.width || 'auto',
                textAlign: item.headerAlign || 'left',
              }"
              :key="item.lable"
            >
              {{ item.lable }}
            </span>
          </div>

          <el-tree
            v-if="dropType === 'tree'"
            class="node-tree"
            ref="treeRef"
            :data="checkOps"
            node-key="id"
            empty-text="暂无数据"
            :expand-on-click-node="true"
            :default-expanded-keys="defaultExpandKeys"
          >
            <!-- :indent="rem2px($px2rem(18))" -->
            <template #default="{ node, data }">
              <van-radio
                v-if="isShowRadio(data)"
                class="node-radio"
                :name="data.id"
                @click.stop="handleClick(data)"
              ></van-radio>
              <div class="node-content">
                <template v-for="item in headerColumn" :key="item.lable">
                  <span v-if="item.prop === 'name'" class="node-txt">
                    {{ data.name }}
                  </span>
                  <span
                    v-else
                    class="node-tag-box"
                    :style="{
                      flex: !item.minWidth && !item.width ? 1 : 'none',
                      minWidth: item.minWidth || 'auto',
                      width: item.width || 'auto',
                    }"
                  >
                    <span class="node-tag-item">
                      {{ getVal(data[item.prop], item) }}
                    </span>
                  </span>
                </template>
              </div>
            </template>
          </el-tree>

          <div
            v-if="dropType === 'select'"
            ref="dropDownRef"
            class="custom-dropdown-box"
          >
            <div
              v-for="ops in checkOps"
              :key="ops.id"
              class="custom-dropdown-item"
              @click="handleClick(ops)"
            >
              <van-radio :name="ops.id"></van-radio>

              <template v-for="item in headerColumn" :key="item.lable">
                <span v-if="item.prop === 'name'" class="node-txt">
                  {{ ops.name }}
                </span>
                <span
                  v-else
                  class="node-tag-box"
                  :style="{
                    flex: !item.minWidth && !item.width ? 1 : 'none',
                    minWidth: item.minWidth || 'auto',
                    width: item.width || 'auto',
                  }"
                >
                  <span class="node-tag-item">
                    {{ getVal(ops[item.prop], item) }}
                  </span>
                </span>
              </template>
            </div>
          </div>
        </van-radio-group>
      </template>
    </van-dropdown-item>
  </van-dropdown-menu>
</template>

<script setup>
import {
  ref,
  computed,
  defineProps,
  defineEmits,
  defineExpose,
  onUnmounted,
} from "vue";
import {
  numThousand,
  formatMilliseconds,
  getLimtNodeId,
} from "@/common/utils/comm";

const props = defineProps({
  checkId: {
    type: [String, Number],
    default: "-1",
  },
  checkName: {
    type: [String, Number],
    default: "全部",
  },
  dropType: {
    type: String,
    default: "tree",
  },
  checkOps: {
    type: Array,
    default: () => [],
  },
  headerColumn: {
    type: Array,
    default: () => [],
  },
  // 是否每级都显示单选框
  isShowCompRadio: {
    type: Boolean,
    default: false,
  },
  // 是否处理非空数据 null undefined ''
  isNum: {
    type: Boolean,
    default: false,
  },
  // 展开的层级,默认展开第一级
  expandLevel: {
    type: [Number, String],
    default: 1,
  },
});
const emits = defineEmits([
  "checkChange",
  "update:checkName",
  "update:checkId",
  "scrollToPlace",
]);
const menuRef = ref(null);
const dropdownItemRef = ref(null);
const treeRef = ref(null);

const chooseId = computed({
  get() {
    return props.checkId;
  },
  set(value) {
    emits("update:checkId", value);
  },
});

const defaultExpandKeys = computed(() => {
  return getLimtNodeId(props.checkOps, props.expandLevel);
});

const getVal = computed(() => {
  return (value, { prop, isToSecond }) => {
    if (props.isNum && (value === null || value === undefined || value === "")) {
      return '--'
    }
    if (isToSecond) {
      return value ? parseFloat((value / 1000).toFixed(2)) : 0;
    }
    if (prop === "aveVisitsTimeUba") {
      return value ? formatMilliseconds(value) : "0时0分0秒";
    }
    return value ? numThousand(value) : 0;
  };
});

const isShowRadio = computed(() => {
  return (data) => {
    if (props.isShowCompRadio) {
      return true;
    } else {
      if (data.level >= 4) {
        return false;
      }
    }
    return true;
  };
});
const handleClick = (ops) => {
  setTimeout(() => {
    emits("update:checkId", ops.id);
    emits("update:checkName", ops.name);
    menuRef.value.close();
    emits("checkChange", ops);
  }, 50);
};
const handleOpen = () => {
  document.body.addEventListener("click", __clickHandler);
  // 滚动至指定元素位置
  emits("scrollToPlace");
};
const handleClose = () => {
  document.body.removeEventListener("click", __clickHandler);
};

// 切换展示状态
const toggle = (statu) => {
  dropdownItemRef.value.toggle(statu);
};
// 滚动到顶部
const scrollToTop = () => {
  let treeDom = document.querySelector(".node-tree");
  let selectDom = document.querySelector(".custom-dropdown-box");
  if (props.dropType === "select") {
    selectDom && (selectDom.scrollTop = 0);
  } else {
    treeDom && (treeDom.scrollTop = 0);
  }
};

const __clickHandler = (e) => {
  console.log("className", e.target.className);
  let blackClass = [
    "",
    "van-nav-bar__content",
    "van-nav-bar__right van-haptics-feedback",
    "van-dropdown-menu__bar van-dropdown-menu__bar--opened",
    "header-bar",
    "header-bar-item",
    "header-bar-item header-bar-item-active",
    "com-wrap user-wrap",
    "header-box",
    "header-box circle-box",
    "com-header",
    "header-title",
    "page-view-analysis",
    "tip-img",
  ];
  if (blackClass.includes(e.target.className)) {
    menuRef.value.close();
  }
};

onUnmounted(() => {
  document.body.removeEventListener("click", __clickHandler);
});
defineExpose({
  toggle,
  scrollToTop,
});
</script>

<style lang="less" scoped>
.custom-dropdown-menu {
  // z-index: 100000;

  &.van-dropdown-menu {
    flex: 1;
    overflow: hidden;
    margin-left: 10px;
  }
  /deep/.van-dropdown-menu__bar {
    height: 24px;
    background: #fff;
    box-shadow: none;
    justify-content: flex-end;
    .van-dropdown-menu__item {
      flex: none;
      max-width: 100%;
      .van-dropdown-menu__title {
        font-size: 14px;
        color: #1d252f;
        padding: 0 11px 0 8px;
        &::after {
          right: 1px;
        }
        &--active {
          color: #526ae7;
        }
      }
    }
  }
  /deep/ .van-dropdown-item {
    max-width: var(--max-width);
    margin: 8px auto 0 auto;
    .van-dropdown-item__content {
      max-height: 100%;
      overflow: hidden;
      border-top: 1px solid rgba(141, 158, 174, 0.22);
      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #1d252f;
        background-color: #dde2eb;
        height: 26px;
        padding: 0 20px 0 15px;
        &.mobile-node-header {
          padding: 0 15px 0 15px;
        }
      }
      .node-tree {
        padding: 5px 10px 0px 30px;
        max-height: 60vh;
        overflow: auto;
        .el-tree-node__content {
          margin-bottom: 5px;
          &:hover {
            // background-color: #fff;
          }
          > .el-tree-node__expand-icon {
            // margin-left: 30px;
          }
        }
        .node-radio {
          position: absolute;
          left: 15px;
          // pointer-events: none;
          .van-radio__icon {
            width: 14px;
            height: 14px;

            &.van-radio__icon--checked {
              border-color: #4960e4;
              .van-radio__icon--dot__icon {
                background: #4960e4;
              }
            }
            &.van-radio__icon--disabled {
              background: rgba(204, 204, 204, 0.32);
              border: 1px solid rgba(204, 204, 204, 0.43);
            }
            .van-radio__icon--dot__icon {
              width: 7px;
              height: 7px;
            }
          }
        }
        .node-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: calc(100% - 30px);
          font-size: 12px;
          .node-txt {
            flex: 1;
            color: rgba(29, 33, 41, 1);
            margin-right: 5px;
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 隐藏超出的内容 */
            text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          }
          .node-tag-box {
            display: flex;
            justify-content: end;
            .node-tag-item {
              display: flex;
              flex-direction: column;
              text-align: center;
              padding: 0 11px;
              border-radius: 33px;
              color: #1d252f;
              background: rgba(221, 226, 235, 0.42);
              line-height: 24px;
              min-width: 50px;
              font-size: 12px;
            }
          }
        }
      }
      .custom-dropdown-box {
        // height: 220px;
        max-height: 60vh;
        overflow: auto;
        .custom-dropdown-item {
          display: flex;
          align-items: center;
          padding: 0 15px 0 15px;
          height: 35px;
          cursor: pointer;
          .van-radio__icon {
            width: 14px;
            height: 14px;
            &.van-radio__icon--checked {
              border-color: #4960e4;
              .van-radio__icon--dot__icon {
                background: #4960e4;
              }
            }
            .van-radio__icon--dot__icon {
              width: 7px;
              height: 7px;
            }
          }
          .dropdown-item-text {
            flex: 1;
            color: #1d252f;
            margin: 0 10px;
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 隐藏超出的内容 */
            text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          }
          .dropdown-item-num {
            line-height: 20px;
            padding: 0 11px;
            border-radius: 15px;
            color: #1d252f;
            background: rgba(221, 226, 235, 0.42);
          }

          .node-txt {
            flex: 1;
            color: rgba(29, 33, 41, 1);
            margin-left: 10px;
            margin-right: 10px;
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 隐藏超出的内容 */
            text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          }
          .node-tag-box {
            display: flex;
            justify-content: end;
            .node-tag-item {
              display: flex;
              flex-direction: column;
              text-align: center;
              padding: 0 11px;
              border-radius: 33px;
              color: #1d252f;
              background: rgba(221, 226, 235, 0.42);
              line-height: 24px;
              min-width: 50px;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
