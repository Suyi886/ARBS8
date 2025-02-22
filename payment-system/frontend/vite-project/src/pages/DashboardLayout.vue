<template>
    <el-container style="height: 100vh;">
      <!-- 头部 -->
      <el-header height="60px" class="header">
        <div class="header-title">后台管理系统</div>
      </el-header>
  
      <el-container>
        <!-- 左侧菜单栏 -->
        <el-aside width="200px" class="aside">
          <el-menu
            class="menu"
            :default-active="activeMenu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard">仪表盘</el-menu-item>
            <el-menu-item index="orders">订单管理</el-menu-item>
            <el-menu-item index="settings">设置</el-menu-item>
          </el-menu>
        </el-aside>
  
        <!-- 主体内容区域 -->
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const activeMenu = ref('dashboard') // 当前选中的菜单项
  
  // 切换菜单后跳转
  const handleMenuSelect = (index: string) => {
    if (index === 'dashboard') router.push('/dashboard')
    else if (index === 'orders') alert('订单管理功能开发中...')
    else if (index === 'settings') alert('设置功能开发中...')
  }
  </script>
  
  <style scoped>
  .header {
    background-color: #409eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .aside {
    background-color: #f5f7fa;
  }
  
  .main {
    padding: 20px;
    background-color: #fff;
  }
  
  .header-title {
    font-weight: bold;
  }
  </style>
  