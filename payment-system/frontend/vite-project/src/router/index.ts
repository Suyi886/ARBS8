import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('@/pages/Home.vue') }, // 首页
  { path: '/dashboard', component: () => import('@/pages/Dashboard.vue') }, // 后台页面
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;