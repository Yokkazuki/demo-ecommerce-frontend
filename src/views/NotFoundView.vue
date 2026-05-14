<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>頁面不存在</p>
    <el-button type="primary" @click="router.push('/')">回到首頁</el-button>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 100px 0;
}
.not-found h1 {
  font-size: 80px;
  color: #dcdfe6;
  margin: 0;
}
.not-found p {
  font-size: var(--font-h3);
  color: #999;
  margin: 16px 0 24px;
}
</style>