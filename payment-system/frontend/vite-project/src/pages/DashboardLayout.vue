<template>
  <el-container style="height: 100vh;">
    <!-- 头部 -->
    <el-header height="60px" class="header">
      <div class="header-title">后台管理系统</div>
      <!-- 添加用户头像和下拉菜单 -->
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="avatar-wrapper">
            <el-avatar 
              size="small"
              :icon="UserFilled"
            />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                ID: {{ userInfo?.id }}
              </el-dropdown-item>
              <el-dropdown-item disabled>
                用户名: {{ userInfo?.username }}
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
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
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('dashboard') // 当前选中的菜单项
const userInfo = userStore.userInfo // 获取用户信息

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  if (index === 'dashboard') router.push('/dashboard')
  else if (index === 'orders') alert('订单管理功能开发中...')
  else if (index === 'settings') alert('设置功能开发中...')
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.clearToken()
    userStore.setUserInfo(null)
    router.push('/login')
  }
}
</script>

<style scoped>
.header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-title {
  font-weight: bold;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  cursor: pointer;
}

.aside {
  background-color: #f5f7fa;
}

.main {
  padding: 20px;
  background-color: #fff;
}
</style>
