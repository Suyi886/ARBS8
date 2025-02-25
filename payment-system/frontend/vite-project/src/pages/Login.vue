<!-- src/pages/Login.vue -->
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>ARBS8 系统登录</h2>
      </template>
      
      <el-form 
        :model="loginForm" 
        :rules="rules" 
        ref="loginFormRef"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 新增注册按钮 -->
        <el-form-item>
          <el-button 
            type="text" 
            @click="goToRegister"
            style="width: 100%"
          >
            没有账号？点击注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-card :deep(.el-card__header) {
  text-align: center;
}

h2 {
  margin: 0;
  color: #409EFF;
}

@media screen and (max-width: 480px) {
  .login-card {
    width: 90%;
  }
}
</style>
