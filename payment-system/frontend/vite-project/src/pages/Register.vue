<!-- src/pages/Register.vue -->
<template>
    <div class="register-container">
      <el-card class="register-card">
        <template #header>
          <h2>ARBS8 系统注册</h2>
        </template>
        
        <el-form 
          :model="registerForm" 
          :rules="rules" 
          ref="registerFormRef"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading"
              @click="handleRegister"
              style="width: 100%"
            >
              注册
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="text" 
              @click="goToLogin"
              style="width: 100%"
            >
              已有账号？返回登录
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
  
  const router = useRouter()
  const registerFormRef = ref<FormInstance>()
  const loading = ref(false)
  
  const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: ''
  })
  
  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入密码'))
    } else if (value !== registerForm.password) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }

  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      { validator: validatePass, trigger: 'blur' }
    ]
  }
  
  const handleRegister = async () => {
    if (!registerFormRef.value) return
    
    try {
      loading.value = true
      await registerFormRef.value.validate()
      
      // 这里后续会添加实际的注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('注册成功')
      router.push('/login')
      
    } catch (error) {
      console.error('注册失败:', error)
      ElMessage.error('注册失败，请检查输入信息')
    } finally {
      loading.value = false
    }
  }

  const goToLogin = () => {
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .register-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
  }
  
  .register-card {
    width: 400px;
  }
  
  .register-card :deep(.el-card__header) {
    text-align: center;
  }
  
  h2 {
    margin: 0;
    color: #409EFF;
  }
  
  @media screen and (max-width: 480px) {
    .register-card {
      width: 90%;
    }
  }
  </style>
