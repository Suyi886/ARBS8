<!-- src/pages/NotFound.vue -->
<template>
    <div class="not-found">
      <h1>404</h1>
      <p>页面未找到</p>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const goBack = () => router.back()
  </script>
  
  <style scoped>
  .not-found {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  h1 {
    font-size: 72px;
    margin-bottom: 20px;
  }
  </style>
  