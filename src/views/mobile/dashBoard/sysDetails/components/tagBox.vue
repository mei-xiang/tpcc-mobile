<template>
  <div class="tag-box">
    <div
      :class="['tag-item', { active: tag.type === active }]"
      v-for="tag in tagList"
      :key="tag"
      @click="handleTag(tag)"
    >
      {{ tag.name }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { debounce } from "lodash";

const props = defineProps({
  tagList: {
    type: Array,
    default: () => [],
  },
  active: {
    type: [String, Number],
    default: "",
  },
});
const emits = defineEmits(["handleTag"]);
const handleTag = debounce((tag) => {
  if (tag.type === props.active) return false;
  emits("update:active", tag.type);
  emits("handleTag", tag);
}, 50);
</script>

<style lang="less" scoped>
.tag-box {
  display: flex;
  border-radius: 40px;
  background-color: #f4f4f4;
  overflow: hidden;
  .tag-item {
    height: 24px;
    line-height: 24px;
    padding: 0 5px;
    border-radius: 40px;
    font-size: 13px;
    color: #7f7f7f;
    margin-right: 3px;
    cursor: pointer;
    &.active {
      color: #fff;
      background-color: #526ae7;
    }
  }
}
</style>
