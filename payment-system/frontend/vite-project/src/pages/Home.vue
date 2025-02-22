<template>
    <div>
      <h1>欢迎来到支付系统</h1>
      <el-button type="primary" @click="goToDashboard">进入后台管理</el-button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'; // 使用 Vue Router
  
  const router = useRouter(); // 获取路由实例
  const goToDashboard = () => {
    router.push('/dashboard'); // 跳转到后台页面
  };
  </script>  