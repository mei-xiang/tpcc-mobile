<template>
  <van-popover
    v-model:show="showPopover"
    close-on-click-outside
    :placement="placement"
    class="van-popover-wrap"
  >
    <!-- <span v-if="showTip" v-html="tipTxt"></span> -->
    <slot v-if="showTip" name="tipTxt"></slot>
    <template #reference>
      <img
        v-if="showTip"
        :src="require('@/assets/images/dashBoard/question.svg')"
        alt=""
        class="tip-img"
      />
    </template>
  </van-popover>
</template>

<script setup>
import { ref, defineProps, onMounted, onUnmounted } from "vue";
const props = defineProps({
  showTip: {
    type: Boolean,
    default: false,
  },
  tipTxt: {
    type: String,
    default: "",
  },
  placement: {
    type: String,
    default: "right",
  },
});
const showPopover = ref(false);
const __clickHandler = (e) => {
  if (e.target.className === "tip-img") return;
  showPopover.value = false;
};

onMounted(() => {
  document.body.addEventListener("click", __clickHandler);
});
onUnmounted(() => {
  document.body.removeEventListener("click", __clickHandler);
});
</script>

<style lang="less">
.van-popover-wrap {
  max-width: 300px;
  .van-popover__arrow {
    top: 50% !important;
  }
}
.van-popover__content {
  white-space: pre-line;
  font-size: 12px;
  margin: 0;
  padding: 4px;
}
</style>
