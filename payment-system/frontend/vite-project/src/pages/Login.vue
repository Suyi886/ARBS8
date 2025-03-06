<!-- src/pages/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-content">
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h2>ARBS8 系统登录</h2>
            <p class="subtitle">欢迎回来，请登录您的账户</p>
          </div>
        </template>
        
        <el-form 
          :model="loginForm" 
          :rules="rules" 
          ref="loginFormRef"
          @keyup.enter="handleLogin"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <el-button 
              type="text" 
              @click="goToRegister"
              class="register-link"
            >
              没有账号？点击注册
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'  // 导入用户store

const router = useRouter()
const userStore = useUserStore()  // 使用用户store
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 设置token和用户信息
    const token = 'demo-token'
    userStore.setToken(token)
    
    // 设置用户信息（模拟从后端获取）
    // 使用用户名生成一个固定的唯一ID
    const generateId = (username: string) => {
      let id = 0
      for (let i = 0; i < username.length; i++) {
        id += username.charCodeAt(i) * (i + 1) // 乘以位置索引+1，使得字符顺序影响ID
      }
      return id * 100 // 移除随机部分，确保相同用户名总是生成相同ID
    }
    
    const userInfo = {
      id: generateId(loginForm.username),
      username: loginForm.username,
      role: 'admin'
    }
    userStore.setUserInfo(userInfo)
    
    ElMessage.success('登录成功')
    router.push('/dashboard')
    
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 新增跳转注册页面方法
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  z-index: 0;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  animation: rotate 30s infinite linear;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 0 20px;
}

.login-card {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.card-header {
  text-align: center;
  padding-bottom: 10px;
}

.login-card :deep(.el-card__header) {
  padding-bottom: 5px;
}

h2 {
  margin: 0;
  color: #1976d2;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin-top: 8px;
  color: #607d8b;
  font-size: 14px;
  font-weight: normal;
}

.login-form {
  padding: 10px 15px;
}

.custom-input {
  margin-bottom: 5px;
}

.custom-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 6px 15px;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 10px;
  background: linear-gradient(90deg, #1976d2, #2196f3);
  border: none;
  transition: all 0.3s;
}

.login-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.form-footer {
  margin-top: 15px;
  text-align: center;
}

.register-link {
  color: #1976d2;
  transition: all 0.3s;
  font-weight: 500;
}

.register-link:hover {
  color: #2196f3;
  text-decoration: underline;
}

@media screen and (max-width: 480px) {
  .login-content {
    padding: 0 15px;
  }
  
  h2 {
    font-size: 24px;
  }
  
  .login-button {
    padding: 10px;
  }
}
</style>
