// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login' // 添加重定向到登录页
  },
  {
    path: '/login',
    name: 'Login', 
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false } // 明确标记不需要认证
  },
  {
    path: '/register', // 新增注册路由
    name: 'Register',
    component: () => import('@/pages/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardLayout.vue'),
    meta: { requiresAuth: true }, // 需要认证
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'orders',  // 订单管理页面
        name: 'Orders',
        component: () => import('@/pages/Orders.vue')
      },
      {
        path: 'settings',  // 设置页面
        name: 'Settings',
        component: () => import('@/pages/Settings.vue')
      }
      // 可以在这里添加更多dashboard子路由
    ]
  },
  {
    path: '/:pathMatch(.*)*', // 处理404路由
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 增强路由守卫逻辑
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')
  
  // 已登录用户访问登录/注册页面时重定向到首页
  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
    return
  }
  
  // 需要认证的页面
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router