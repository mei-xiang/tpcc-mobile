<template>
  <div class="empty-wrapper">
    <div class="empty">
      <img src="../assets/images/empty.png" alt="">
    </div>
    <div class="description">{{ description }}</div>
  </div>
</template>

<script>
export default {
  props: {
    description: String
  },
  setup () {
    return {
    }
  }
}
</script>

<style lang="less" scoped>
.empty-wrapper {
  display: flex;
  flex-direction: column;
  padding: 15px 0;
  .empty {
    width: 160px;
    height: 160px;
    margin: 0 auto;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .description {
    text-align: center;
    color: #455467;
    font-size: 12px;
  }

}
@media screen and (min-width: 600px) {
  .empty-wrapper {
    .description {
      font-size: 14px;
    }
  }
}
</style>
