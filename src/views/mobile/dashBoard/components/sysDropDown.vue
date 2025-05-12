<template>
  <van-dropdown-menu ref="menuRef" class="custom-dropdown-menu">
    <van-dropdown-item :teleport="teleport" class="sys-van-dropdown-item">
      <template #title>
        <span class="look-more-text">更多 >></span>
      </template>
      <template #default>
        <div ref="dropDownRef" class="custom-dropdown-box">
          <div
            v-for="(row, idx) in checkOps"
            :key="row.sysName"
            class="custom-dropdown-item"
            @click="handleClick(row)"
          >
            <span class="dropdown-item-text">
              {{ idx + 1 }}.{{ row.sysName }}
            </span>
          </div>
        </div>
      </template>
    </van-dropdown-item>
  </van-dropdown-menu>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits } from "vue";

const props = defineProps({
  checkOps: {
    type: Array,
    default: () => [],
  },
});
const emits = defineEmits(["sysClick"]);

const menuRef = ref(null);
const dropDownRef = ref(null);
const teleport = ref(null);

const handleClick = (row) => {
  setTimeout(() => {
    menuRef.value.close();
    emits("sysClick", row);
  }, 50);
};

onMounted(() => {
  teleport.value = "#dashBoard";
});
</script>

<style lang="less" scoped>
.custom-dropdown-menu {
  // z-index: 100000;
  /deep/.van-dropdown-menu__bar {
    height: 24px;
    background: transparent;
    box-shadow: none;

    .van-dropdown-menu__item {
      justify-content: right;
      .van-dropdown-menu__title {
        line-height: normal;
        padding: 0;
        font-size: 12px;
        color: #455467;
        &::after {
          right: 1px;
        }
        &--active {
          color: #526ae7;
        }
      }
    }
    .van-dropdown-menu__title--down:after {
      display: none;
    }
  }

  .look-more-text {
    cursor: pointer;
  }
}
</style>
<style lang="less">
.sys-van-dropdown-item {
  max-width: var(--max-width);
  margin: 6px auto 0 auto;
  // width: 100%;
  /* position: fixed; */
  /* left: 50%; */
  /* transform: translateX(-50%); */
  .van-dropdown-item__content {
    max-height: 100%;
    overflow: hidden;
    // border-top: 1px solid rgba(141, 158, 174, 0.22);

    .custom-dropdown-box {
      // height: 220px;
      max-height: 40vh;
      overflow: auto;
      .custom-dropdown-item {
        display: flex;
        align-items: center;
        line-height: 30px;
        cursor: pointer;

        .dropdown-item-text {
          flex: 1;
          color: #1d252f;
          margin: 0 15px;
          white-space: nowrap; /* 不换行 */
          overflow: hidden; /* 隐藏超出的内容 */
          text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
          cursor: pointer;
          text-decoration: underline;
          color: #526ae7;
        }
      }
    }
  }
}
</style>
