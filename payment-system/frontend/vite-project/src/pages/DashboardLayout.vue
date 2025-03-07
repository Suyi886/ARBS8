<template>
  <el-container class="dashboard-layout">
    <!-- 头部 -->
    <el-header height="64px" class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">ARBS8</span>
          <span class="logo-subtitle">支付系统</span>
        </div>
      </div>
      
      <!-- 添加用户头像和下拉菜单 -->
      <div class="header-right">
        <el-tooltip
          content="点击查看更多选项"
          placement="bottom"
          :enterable="false"
        >
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-wrapper">
              <el-avatar 
                :size="36"
                :icon="UserFilled"
                class="user-avatar"
              />
              <span class="username">{{ userInfo?.username }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown">
                <el-dropdown-item class="user-info-item" disabled>
                  <el-icon><InfoFilled /></el-icon>
                  <span>ID: {{ userInfo?.id }}</span>
                </el-dropdown-item>
                <el-dropdown-item class="user-info-item" disabled>
                  <el-icon><User /></el-icon>
                  <span>用户名: {{ userInfo?.username }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="logout-item">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧菜单栏 -->
      <el-aside width="220px" class="aside">
        <div class="menu-wrapper">
          <el-menu
            class="menu"
            :default-active="activeMenu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard" class="menu-item">
              <el-icon><Monitor /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-menu-item index="orders" class="menu-item">
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="customers" class="menu-item">
              <el-icon><User /></el-icon>
              <span>客户管理</span>
            </el-menu-item>
            <el-menu-item index="settings" class="menu-item">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
            <el-menu-item index="help-center" class="menu-item">
              <el-icon><QuestionFilled /></el-icon>
              <span>帮助中心管理</span>
            </el-menu-item>
            <el-menu-item index="migrate-users" class="menu-item">
              <el-icon><Upload /></el-icon>
              <span>用户数据迁移</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <div class="sidebar-footer">
          <span class="version">版本 v1.0.0</span>
        </div>
      </el-aside>

      <!-- 主体内容区域 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UserFilled, 
  ArrowDown,
  Monitor,
  Document,
  Setting,
  InfoFilled,
  User,
  SwitchButton,
  QuestionFilled,
  Upload
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('dashboard') // 当前选中的菜单项
const userInfo = computed(() => userStore.userInfo) // 使用计算属性获取用户信息

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  if (index === 'dashboard') router.push('/admin')
  else if (index === 'orders') router.push('/admin/orders')
  else if (index === 'customers') router.push('/admin/customers')
  else if (index === 'settings') router.push('/admin/settings')
  else if (index === 'help-center') router.push('/admin/help-center')
  else if (index === 'migrate-users') router.push('/admin/migrate-users')
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
.dashboard-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  font-size: 12px;
  color: #80868b;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.avatar-wrapper:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background-color: #e3f2fd;
  color: #1976d2;
}

.username {
  margin: 0 8px;
  color: #5f6368;
  font-size: 14px;
}

.dropdown-icon {
  color: #9aa0a6;
  font-size: 12px;
  transition: transform 0.3s;
}

.avatar-wrapper:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-dropdown {
  min-width: 200px;
}

.user-info-item {
  display: flex;
  align-items: center;
}

.user-info-item :deep(.el-icon) {
  margin-right: 8px;
  color: #5f6368;
}

.logout-item {
  color: #d32f2f;
}

.logout-item :deep(.el-icon) {
  color: #d32f2f;
}

.main-container {
  height: calc(100vh - 64px);
}

.aside {
  background-color: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
  position: relative;
  z-index: 5;
}

.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
}

.menu {
  border-right: none;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  margin: 8px 16px;
  border-radius: 8px;
  width: calc(100% - 32px);
}

.menu-item :deep(.el-icon) {
  margin-right: 10px;
}

.sidebar-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.version {
  color: #9aa0a6;
  font-size: 12px;
}

.main {
  padding: 24px;
  overflow-y: auto;
}

/* 转场动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .aside {
    width: 64px !important;
  }
  
  .logo-subtitle,
  .username {
    display: none;
  }
  
  .menu-item {
    padding: 0 !important;
    display: flex;
    justify-content: center;
  }
  
  .menu-item :deep(span) {
    display: none;
  }
  
  .menu-item :deep(.el-icon) {
    margin-right: 0;
  }
  
  .sidebar-footer {
    padding: 8px;
  }
  
  .version {
    display: none;
  }
  
  .main {
    padding: 16px;
  }
}
</style>
