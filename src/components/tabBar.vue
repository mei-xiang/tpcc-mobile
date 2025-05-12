<template>
  <div class="nav-tabs">
    <div
      :class="['tab-item', { 'tab-active-item': tab.active === props.active }]"
      v-for="tab in data.list"
      :key="tab.name"
      @click="tabChange(tab)"
    >
      <img :src="getImg(tab)" alt="" />
      <span>{{ tab.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
  active: {
    type: Number,
    default: 0,
  },
});
const router = useRouter();
const data = reactive({
  list: [
    {
      activeImg: require("@/assets/images/todo-active.png"),
      unActiveimg: require("@/assets/images/todo-no-active.png"),
      name: "待办",
      pageUrl: "/toDoList",
      active: 0,
    },
    {
      activeImg: require("@/assets/images/board-active.png"),
      unActiveimg: require("@/assets/images/board-no-active.png"),
      name: "运维看板",
      pageUrl: "/dashBoard",
      active: 1,
    },
  ],
});
const getImg = computed(() => {
  return (tab) => {
    return tab.active === props.active ? tab.activeImg : tab.unActiveimg;
  };
});
const tabChange = ({ active, pageUrl }) => {
  // emits('tabChange', active)
  router.push(pageUrl);
};
// const emits = defineEmits(["tabChange"]);
</script>

<style lang="less" scoped>
.nav-tabs {
  position: fixed;
  bottom: 0;
  z-index: 9999;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  height: 50px;
  padding: 10px 0;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #c4c4c4;
    img {
      width: 19px;
      height: 18px;
    }
    span {
      font-size: 12px;
    }
    &.tab-active-item {
      span {
        color: #3062d4;
      }
    }
  }
}
</style>
