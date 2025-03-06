<!-- src/pages/Register.vue -->
<template>
    <div class="register-container">
      <div class="register-content">
        <el-card class="register-card">
          <template #header>
            <div class="card-header">
              <h2>ARBS8 系统注册</h2>
              <p class="subtitle">创建您的账户，开始使用系统</p>
            </div>
          </template>
          
          <el-form 
            :model="registerForm" 
            :rules="rules" 
            ref="registerFormRef"
            class="register-form"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="registerForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                prefix-icon="Lock"
                show-password
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="role">
              <el-radio-group v-model="registerForm.role" class="role-selection">
                <el-radio label="client">注册为客户</el-radio>
                <el-radio label="admin">注册为管理员</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading"
                @click="handleRegister"
                class="register-button"
              >
                注册
              </el-button>
            </el-form-item>

            <div class="form-footer">
              <el-button 
                type="text" 
                @click="goToLogin"
                class="login-link"
              >
                已有账号？返回登录
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
  
  const router = useRouter()
  const registerFormRef = ref<FormInstance>()
  const loading = ref(false)
  
  const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'client' // 默认选择客户角色
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
    ],
    role: [
      { required: true, message: '请选择角色', trigger: 'change' }
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
    background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
    position: relative;
    overflow: hidden;
  }
  
  .register-container::before {
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
  
  .register-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 450px;
    padding: 0 20px;
  }
  
  .register-card {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .register-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    text-align: center;
    padding-bottom: 10px;
  }
  
  .register-card :deep(.el-card__header) {
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
  
  .register-form {
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

  .role-selection {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin: 10px 0;
  }
  
  .register-button {
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
  
  .register-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }
  
  .form-footer {
    margin-top: 15px;
    text-align: center;
  }
  
  .login-link {
    color: #1976d2;
    transition: all 0.3s;
    font-weight: 500;
  }
  
  .login-link:hover {
    color: #2196f3;
    text-decoration: underline;
  }
  
  @media screen and (max-width: 480px) {
    .register-content {
      padding: 0 15px;
    }
    
    h2 {
      font-size: 24px;
    }
    
    .register-button {
      padding: 10px;
    }
  }
  </style>
