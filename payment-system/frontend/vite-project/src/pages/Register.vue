<!-- src/pages/Register.vue -->
<template>
    <div class="register-container">
      <div class="language-switcher-container">
        <LanguageSwitcher />
      </div>
      <div class="register-content">
        <el-card class="register-card">
          <template #header>
            <div class="card-header">
              <h2>{{ $t('register.title') }}</h2>
              <p class="subtitle">{{ $t('register.subtitle') }}</p>
              <p class="user-hint">{{ $t('register.userHint') }}</p>
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
                :placeholder="$t('register.username')"
                prefix-icon="User"
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password"
                type="password"
                :placeholder="$t('register.password')"
                prefix-icon="Lock"
                show-password
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword"
                type="password"
                :placeholder="$t('register.confirmPassword')"
                prefix-icon="Lock"
                show-password
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading"
                @click="handleRegister"
                class="register-button"
              >
                {{ $t('register.registerButton') }}
              </el-button>
            </el-form-item>

            <div class="form-footer">
              <el-button 
                type="text" 
                @click="goToLogin"
                class="login-link"
              >
                {{ $t('register.loginLink') }}
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
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue'  // 导入语言切换组件
  import { useI18n } from 'vue-i18n'  // 导入useI18n钩子
  
  const router = useRouter()
  const userStore = useUserStore()  // 使用用户store
  const { t } = useI18n()  // 使用i18n的t函数
  const registerFormRef = ref<FormInstance>()
  const loading = ref(false)
  
  const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user' // 默认且唯一可选的角色就是用户
  })
  
  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.passwordRequired')))
    } else if (value !== registerForm.password) {
      callback(new Error(t('register.passwordMismatch')))
    } else {
      callback()
    }
  }

  const rules = {
    username: [
      { required: true, message: t('register.usernameRequired'), trigger: 'blur' },
      { min: 3, message: t('register.usernameLength'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('register.passwordRequired'), trigger: 'blur' },
      { min: 6, message: t('register.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('register.passwordRequired'), trigger: 'blur' },
      { validator: validatePass, trigger: 'blur' }
    ]
  }
  
  const handleRegister = async () => {
    if (!registerFormRef.value) return
    
    try {
      loading.value = true
      await registerFormRef.value.validate()
      
      // 显示注册请求信息
      console.log('提交注册表单:', {
        username: registerForm.username,
        role: registerForm.role
      })
      
      // 使用userStore中的register方法进行注册
      await userStore.register(
        registerForm.username,
        registerForm.password,
        registerForm.role
      )
      
      ElMessage.success('注册成功')
      router.push('/login')
      
    } catch (error: any) {
      console.error('注册失败:', error)
      
      // 显示更详细的错误信息
      if (error.response && error.response.data) {
        ElMessage.error(error.response.data.message || t('register.serverError'));
      } else {
        ElMessage.error(userStore.error || t('register.inputError'));
      }
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
  
  .language-switcher-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
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
  
  .user-hint {
    margin-top: 5px;
    color: #f56c6c;
    font-size: 12px;
    font-style: italic;
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
