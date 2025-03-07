// API服务工具
// 提供统一的API请求处理和本地回退功能

import { ElMessage } from 'element-plus';

// API基础URL配置
const API_BASE_URL = 'http://localhost:5173/api';

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