<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <suspense>
          <component :is="Component" />
          <template #fallback>
            <div class="loading">加载中...</div>
          </template>
        </suspense>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted } from 'vue'
import { useModuleStore } from '@/stores/module'
import { useUserStore } from './stores/user'
import { useI18n } from 'vue-i18n'

// 错误处理
onErrorCaptured((err) => {
  console.error('[App Error]:', err)
  return true // 继续传播错误
})

// 重试函数
const retry = () => {
  window.location.reload()
}

const moduleStore = useModuleStore()
console.log(moduleStore.modules)

const userStore = useUserStore()
const i18n = useI18n()

// 初始化时从本地存储加载语言偏好
const initLanguage = () => {
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage) {
    i18n.locale.value = savedLanguage
    document.documentElement.lang = savedLanguage
  }
}

onMounted(() => {
  // 初始化语言
  initLanguage()
  
  // 其他初始化...
  // ...
})
</script>

<style>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 加载状态 */
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

/* 错误状态 */
.error {
  color: #dc3545;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.error pre {
  white-space: pre-wrap;
  background: #ffe6e6;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: left;
}

.error button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.error button:hover {
  background: #c82333;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
