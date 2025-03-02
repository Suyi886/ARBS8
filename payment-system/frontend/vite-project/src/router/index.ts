import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  }
  // 其他路由配置...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router