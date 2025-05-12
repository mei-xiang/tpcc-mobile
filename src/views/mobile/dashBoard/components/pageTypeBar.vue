<template>
  <div class="header-bar">
    <div
      :class="[
        'header-bar-item',
        { 'header-bar-item-active': pageType === item.pageType },
      ]"
      v-for="item in tabList"
      :key="item.pageType"
      @click="handleBarClick(item)"
    >
      {{ item.pageTitle }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from "vue";
const props = defineProps({
  tabList: {
    type: Array,
    default: () => [],
  },
  pageType: {
    type: [Number, String],
    default: 0,
  },
});
const data = reactive({});
const emits = defineEmits(["handleBarClick"]);
onMounted(() => {});
const handleBarClick = (item) => {
  emits("handleBarClick", item);
};
</script>

<style lang="less" scoped>
.header-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background-color: transparent;
  .header-bar-item {
    font-size: 15px;
    color: #455467;
    padding: 0 10px;
    border-right: 1px solid #a6a6a6;
    font-weight: 700;
    cursor: pointer;
    &:last-child {
      border-right: none;
    }
    &-active {
      color: #526ae7;
    }
  }
}
</style>
