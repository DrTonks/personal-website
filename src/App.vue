<template>

  <el-config-provider :locale="language">
    <router-view
    ></router-view>
  </el-config-provider>
</template>
<script setup>
import { ref } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const language = ref(zhCn)

</script>


<style>
*{
    padding: 0;
    margin: 0;
    text-decoration: none;
}

#app{
    width: 100%;
    height: 100vh;
    position: relative;
}
</style>
