// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login', 
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register', 
    component: () => import('@/pages/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: false }
  },
  // 隐藏注册页面 - 仅管理员知晓此URL
  {
    path: '/secure-registration-xK7p9Z',
    name: 'SecureRegister',
    component: () => import('@/pages/SecureRegistration.vue'),
    meta: { requiresAuth: false }
  },
  // 管理员后台路由
  {
    path: '/admin',
    component: () => import('@/pages/DashboardLayout.vue'),
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/pages/admin/OrderManagement.vue')
      },
      {
        path: 'customers',
        name: 'AdminCustomers',
        component: () => import('@/pages/admin/CustomerManagement.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/pages/Settings.vue')
      },
      {
        path: 'help-center',
        name: 'AdminHelpCenter',
        component: () => import('@/pages/admin/HelpCenterManagement.vue')
      },
      {
        path: 'migrate-users',
        name: 'MigrateUsers',
        component: () => import('@/pages/admin/UserMigration.vue')
      }
    ]
  },
  // 客户前台路由
  {
    path: '/client',
    component: () => import('@/pages/client/ClientLayout.vue'),
    meta: { 
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'ClientDashboard',
        component: () => import('@/pages/client/ClientDashboard.vue')
      },
      {
        path: 'orders',
        name: 'ClientOrders',
        component: () => import('@/pages/client/OrderStatus.vue')
      },
      {
        path: 'recharge',
        name: 'ClientRecharge',
        component: () => import('@/pages/client/Recharge.vue')
      },
      {
        path: 'withdraw',
        name: 'ClientWithdraw',
        component: () => import('@/pages/client/Withdraw.vue')
      },
      {
        path: 'messages',
        name: 'ClientMessages',
        component: () => import('@/pages/client/Messages.vue')
      },
      {
        path: 'settings',
        name: 'ClientSettings',
        component: { 
          template: '<div class="page-container"><h2>账户设置</h2><p>该功能正在开发中...</p></div>' 
        }
      }
    ]
  },
  // 原始路由保留，但重定向到新的角色路由
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: (to) => {
      const userStore = useUserStore()
      return userStore.isAdmin ? '/admin' : '/client'
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

// 检查router的创建是否类似这样
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 您的路由配置
  ]
})

// 加强路由守卫 - 严格的权限控制
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  const isAdmin = userStore.isAdmin
  
  // 已登录用户访问登录页面时重定向到相应的首页
  if (isLoggedIn && to.path === '/login') {
    next(isAdmin ? '/admin' : '/client')
    return
  }
  
  // 需要管理员权限的页面，非管理员不可访问
  if (to.meta.requiresAdmin && !isAdmin) {
    ElMessage.error('您没有权限访问该页面')
    next('/client')
    return
  }
  
  // 需要认证的页面，未登录用户重定向到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router