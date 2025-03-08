import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'
import ru from './locales/ru'
import es from './locales/es'

// 获取浏览器首选语言
const getBrowserLanguage = (): string => {
  const storedLang = localStorage.getItem('preferred-language')
  if (storedLang) return storedLang

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('ru')) return 'ru'
  if (browserLang.startsWith('es')) return 'es'
  return 'en' // 默认英语
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: getBrowserLanguage(),
  fallbackLocale: 'en', // 如果找不到相应语言的翻译，回退到英语
  messages: {
    zh,
    en,
    ru,
    es
  }
})

export default i18n 