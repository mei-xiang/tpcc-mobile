<template>
  <div class="container space-between-align">
    <div class="l"></div>
    <div class="m">没有更多内容了</div>
    <div class="r"></div>
  </div>
</template>

<script>
export default {
  name: 'Nothing'
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  margin: 20px auto 80px;
  padding: 10px 16px 28px;
  .l {
    flex: 1;
    height: 1px;
    background: rgba(196, 196, 196, 0.4);
  }
  .m {
    color: #5f6c78;
    font-size: 12px;
    padding: 0 19px;
  }
  .r {
    flex: 1;
    height: 1px;
    background: rgba(196, 196, 196, 0.4);
  }
}
</style>
