// API服务工具
// 提供统一的API请求处理和本地回退功能

import { ElMessage } from 'element-plus';
import axios from 'axios';

// API基础URL配置
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://arbs8-backend.onrender.com/api' // 生产环境API地址
  : 'http://localhost:3001/api';             // 开发环境API地址

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加身份验证token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response,
  error => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      // 清除本地存储的令牌和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 重定向到登录页面
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API请求函数
const apiService = {
  // 用户注册
  register: async (userData: { username: string; password: string; role?: string }) => {
    // 确保角色值正确传递
    const requestData = {
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user' // 确保有默认值
    };
    
    console.log('注册请求数据:', JSON.stringify(requestData)); // 添加日志，查看请求数据
    try {
      const response = await api.post('/register', requestData);
      console.log('注册响应:', response.data); // 添加日志，查看响应
      return response.data;
    } catch (error: any) {
      console.error('注册API错误:', error); 
      // 更详细的错误信息
      if (error.response) {
        console.error('服务器响应:', error.response.status, error.response.data);
      }
      throw error;
    }
  },
  
  // 用户登录
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/login', credentials);
    // 保存token和用户信息到localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    return response.data;
  },
  
  // 获取所有用户（管理员）
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      console.log('从API获取所有用户:', response.data);
      return response.data.users;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      // 返回本地存储的用户作为备用
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('从本地存储获取用户备用数据:', users.length);
        return users;
      }
      return [];
    }
  },
  
  // 获取单个用户信息
  getUserInfo: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data.user;
  },
  
  // 更新用户状态
  updateUserStatus: async (userId: number, status: 'active' | 'inactive') => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },
  
  // 更新用户余额
  updateUserBalance: async (userId: number, balance: number) => {
    const response = await api.patch(`/users/${userId}/balance`, { balance });
    return response.data;
  },
  
  // 删除用户
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  
  // 迁移localStorage用户数据到MySQL
  migrateUsers: async (users: any[]) => {
    const response = await api.post('/migrate-users', { users });
    return response.data;
  },
  
  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  }
};

export default apiService;

// 支持的API端点
export enum ApiEndpoint {
  WITHDRAW = '/withdraw',
  RECHARGE = '/recharge',
  ORDERS = '/orders',
  USER = '/user'
}

// API请求函数
export async function apiRequest<T>(
  endpoint: ApiEndpoint, 
  method: 'GET' | 'POST' = 'GET',
  data?: any,
  useLocalFallback: boolean = true
): Promise<{
  success: boolean;
  data?: T;
  localFallback: boolean;
  error?: any;
}> {
  try {
    // 构建请求URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 构建请求配置
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // credentials: 'include' // 如果需要发送Cookie
    };
    
    // 添加请求体（如果是POST请求）
    if (method === 'POST' && data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`发起${method}请求到: ${url}`, data);
    
    // 设置超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 5000);
    });
    
    // 发起请求
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise
    ]);
    
    // 检查HTTP状态码
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    // 获取响应文本
    const responseText = await response.text();
    
    // 尝试解析JSON
    let responseData;
    try {
      // 如果响应不为空，则解析为JSON
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (e: any) {
      throw new Error(`无法解析响应: ${e.message}, 原始响应: ${responseText}`);
    }
    
    // 成功返回
    return {
      success: true,
      data: responseData,
      localFallback: false
    };
  } catch (error) {
    console.error(`API请求失败 (${endpoint}):`, error);
    
    // 如果不使用本地回退，则直接抛出错误
    if (!useLocalFallback) {
      throw error;
    }
    
    // 显示友好的错误消息
    ElMessage.warning({
      message: `由于无法连接到支付平台，系统将使用本地模拟处理您的请求。`,
      duration: 3000
    });
    
    // 返回带有错误信息的结果，指示使用了本地回退
    return {
      success: false,
      localFallback: true,
      error
    };
  }
}

// 提交提现请求
export async function submitWithdraw(withdrawData: any) {
  return apiRequest(ApiEndpoint.WITHDRAW, 'POST', withdrawData);
}

// 提交充值请求
export async function submitRecharge(rechargeData: any) {
  return apiRequest(ApiEndpoint.RECHARGE, 'POST', rechargeData);
}

// 获取订单列表
export async function getOrders(params?: any) {
  return apiRequest(ApiEndpoint.ORDERS, 'GET', params);
}

// 获取用户信息
export async function getUserInfo(userId: string | number) {
  return apiRequest(ApiEndpoint.USER, 'GET', { userId });
}