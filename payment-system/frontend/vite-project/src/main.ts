import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { webSocketService } from './utils/websocket'

const app = createApp(App)
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

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

app.mount('#app')