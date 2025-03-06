<template>
  <div class="home-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    
    <div class="content-wrapper">
      <div class="content-box">
        <h1 class="welcome-title">
          <span class="primary-text">ARBS8</span>
          <span class="divider"></span>
          <span>支付系统</span>
        </h1>
        
        <p class="welcome-description">
          简单、安全、高效的支付解决方案
        </p>
        
        <div class="features">
          <div class="feature-item">
            <el-icon class="feature-icon"><Money /></el-icon>
            <span>安全支付</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Timer /></el-icon>
            <span>快速到账</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><DataAnalysis /></el-icon>
            <span>数据分析</span>
          </div>
        </div>
        
        <el-button 
          type="primary" 
          size="large"
          class="login-button"
          @click="goToLogin"
        >
          <el-icon class="icon"><Key /></el-icon>
          登录系统
        </el-button>
        
        <el-button 
          type="default" 
          size="large"
          class="dashboard-button"
          @click="goToDashboard"
        >
          <el-icon class="icon"><Monitor /></el-icon>
          进入后台
        </el-button>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2024 ARBS8 支付系统 | 版本 v1.0.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Money, Timer, DataAnalysis, Key, Monitor } from '@element-plus/icons-vue'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%);
}

.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  background: linear-gradient(45deg, #bbdefb, #90caf9);
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
  animation: float 20s infinite alternate ease-in-out;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: -100px;
  animation: float 25s infinite alternate-reverse ease-in-out;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 30%;
  right: 10%;
  animation: float 18s infinite alternate ease-in-out;
}

.shape-4 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 10%;
  animation: float 22s infinite alternate-reverse ease-in-out;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(30px, 30px) rotate(15deg);
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  z-index: 2;
}

.content-box {
  max-width: 700px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 48px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.content-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.welcome-title {
  font-size: 42px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  line-height: 1.2;
}

.primary-text {
  color: #1976d2;
}

.divider {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #1976d2;
  border-radius: 50%;
  margin: 0 16px;
}

.welcome-description {
  font-size: 18px;
  color: #606266;
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 24px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 32px;
  color: #1976d2;
  margin-bottom: 12px;
  padding: 16px;
  background-color: #e3f2fd;
  border-radius: 50%;
}

.login-button, .dashboard-button {
  padding: 12px 32px;
  font-size: 16px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  margin: 0 10px;
  margin-bottom: 10px;
}

.login-button {
  background: linear-gradient(90deg, #1976d2, #2196f3);
  border: none;
}

.dashboard-button {
  border: 2px solid #1976d2;
  color: #1976d2;
}

.icon {
  margin-right: 8px;
}

.login-button:hover, .dashboard-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.footer {
  padding: 20px;
  text-align: center;
  color: #909399;
  background-color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 2;
}

@media screen and (max-width: 768px) {
  .content-box {
    padding: 32px;
    margin: 20px;
  }
  
  .welcome-title {
    font-size: 32px;
    flex-direction: column;
  }
  
  .divider {
    display: none;
  }
  
  .feature-item {
    margin: 0 10px 20px;
  }
  
  .login-button, .dashboard-button {
    width: 100%;
    margin: 5px 0;
  }
}
</style>