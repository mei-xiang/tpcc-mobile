<template>
  <!-- SQL审核卡片列表 -->
  <div
    v-for="item in dbmList"
    :key="item"
    :class="['todo-tab-box', 'todo-tab-content']"
    @click="goToDetails(item)"
  >
    <h3 class="title">{{ item.showTitle }}</h3>
    <p class="text">{{ item.groupName }}</p>
    <div class="flex">
      <div>
        <span class="tag">
          <van-tag color="#f1f2f9" text-color="#455467">审批中</van-tag>
        </span>
      </div>
      <div class="name-box">
        <span class="logo">{{
          item.createUserDisplay && item.createUserDisplay.slice(-2)
        }}</span>
        <span class="text">{{ item.createUserDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";

const props = defineProps({
  dbmList: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["goToDetails"]);

const goToDetails = (item) => {
  emit("goToDetails", item);
};
</script>

<style lang="less" scoped>
</style>