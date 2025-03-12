import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from './i18n'
import { webSocketService } from './utils/websocket'

// 添加调试信息
console.log('开始创建Vue应用...')

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 添加错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue错误:', err)
  console.error('错误信息:', info)
}

console.log('应用插件中...')
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// 在应用加载完成后初始化WebSocket连接
router.afterEach((to, from) => {
  // 当用户已登录且路由包含 admin 或 client 时自动连接WebSocket
  if (
    (to.path.includes('/admin') || to.path.includes('/client')) &&
    !webSocketService.getConnectionStatus()
  ) {
    webSocketService.connect()
  }
  
  // 如果用户退出登录（离开admin/client区域），则断开WebSocket连接
  if (
    (from.path.includes('/admin') || from.path.includes('/client')) &&
    !to.path.includes('/admin') && !to.path.includes('/client') &&
    webSocketService.getConnectionStatus()
  ) {
    webSocketService.disconnect()
  }
})

console.log('开始挂载应用...')
app.mount('#app')
console.log('应用挂载完成!')