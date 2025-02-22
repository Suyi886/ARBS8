<template>
  <div class="home-container">
    <div class="content-box">
      <h1 class="welcome-title">欢迎来到支付系统</h1>
      <!-- 去掉图标 -->
      <el-button 
        type="primary" 
        size="large"
        class="admin-button"
        @click="goToDashboard"
      >
        进入后台管理
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.content-box {
  padding: 48px 64px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.welcome-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 32px;
  font-weight: 600;
}

.admin-button {
  padding: 12px 32px;
  font-size: 16px;
  transition: all 0.3s;
}

.admin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

@media screen and (max-width: 768px) {
  .content-box {
    padding: 32px;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .welcome-title {
    font-size: 24px;
  }
}
</style>