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
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 用户数据库（模拟）
const userDb = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user1', password: 'user123', role: 'client' },
  { id: 101, username: 'suyi6', password: '123456', role: 'client' },
]

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    // 模拟登录验证 - 在实际项目中应该调用API进行身份验证
    const user = userDb.find(u => 
      u.username === loginForm.username && 
      u.password === loginForm.password
    )
    
    if (!user) {
      ElMessage.error('用户名或密码错误')
      return
    }
    
    // 设置token和用户信息
    const token = 'demo-token-' + user.id
    userStore.setToken(token)
    
    // 设置用户信息
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role
    }
    userStore.setUserInfo(userInfo)
    
    ElMessage.success('登录成功')
    
    // 根据角色自动跳转到相应页面
    if (user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/client')
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
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
  margin-top: 10px;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 8px;
}
</style>
