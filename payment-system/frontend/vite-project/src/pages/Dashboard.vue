<template>
  <div class="dashboard-container">
    <el-container>
      <el-header>
        <h2>后台管理系统</h2>
      </el-header>
      
      <el-container>
        <el-aside width="200px">
          <el-menu default-active="1">
            <el-menu-item index="1">
              <el-icon><Monitor /></el-icon>
              <span>控制台</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Monitor, Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
