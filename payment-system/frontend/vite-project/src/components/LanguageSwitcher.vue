<!-- src/components/LanguageSwitcher.vue -->
<template>
  <div class="language-switcher">
    <el-dropdown trigger="click" @command="handleLanguageChange">
      <span class="language-dropdown-link">
        <el-icon class="language-icon"><Location /></el-icon>
        {{ currentLanguageLabel }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="lang in languages" 
            :key="lang.code" 
            :command="lang.code"
            :class="{ 'is-active': currentLanguage === lang.code }"
          >
            <span class="language-item">
              <span class="language-flag">{{ lang.flag }}</span>
              <span class="language-name">{{ lang.label }}</span>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Location, ArrowDown } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

// 定义支持的语言
const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
]

// 使用vue-i18n的useI18n组合式API
const i18n = useI18n()

// 获取当前语言
const currentLanguage = ref(i18n.locale.value)

// 计算当前语言标签
const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.code === currentLanguage.value)
  return lang ? `${lang.flag} ${lang.label}` : '🇨🇳 中文'
})

// 处理语言切换
const handleLanguageChange = (langCode: string) => {
  // 切换当前语言
  currentLanguage.value = langCode
  i18n.locale.value = langCode
  
  // 保存语言偏好到本地存储
  localStorage.setItem('preferred-language', langCode)
  
  // 触发应用内语言变更
  document.documentElement.lang = langCode
}

// 初始化时从本地存储加载语言偏好
const initLanguage = () => {
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
    handleLanguageChange(savedLanguage)
  }
}

// 初始化语言
initLanguage()
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.language-dropdown-link:hover {
  background-color: #f5f7fa;
}

.language-icon {
  margin-right: 5px;
  font-size: 16px;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-flag {
  font-size: 16px;
}

.is-active {
  color: #409EFF;
  font-weight: bold;
  background-color: #ecf5ff;
}
</style> 