import { ref } from 'vue'
import { ElNotification } from 'element-plus'

// 订单状态变更事件类型
export interface OrderStatusChangeEvent {
  orderId: number | string
  orderNumber: string
  type: 'recharge' | 'withdraw'
  oldStatus: string
  newStatus: string
  timestamp: string
  updatedBy: string
  remark?: string
  message?: string
}

// 新订单事件类型
export interface NewOrderEvent {
  orderId: number | string
  orderNumber: string
  type: 'recharge' | 'withdraw'
  amount: string
  status: string
  timestamp: string
  message?: string
}

// 通用事件类型
export interface SystemNotificationEvent {
  type: 'system'
  title: string
  message: string
  timestamp: string
}

// 组合所有事件类型
export type WebSocketEvent = OrderStatusChangeEvent | NewOrderEvent | SystemNotificationEvent

/**
 * WebSocket服务模拟类
 * 在实际生产环境中，这个类将使用真实的WebSocket连接
 * 这里仅作为演示使用，模拟WebSocket通信
 */
export class WebSocketService {
  private static instance: WebSocketService
  private isConnected = ref(false)
  private listeners: ((event: WebSocketEvent) => void)[] = []
  private mockInterval: number | null = null
  
  // 是否启用模拟数据生成
  private enableMockData: boolean = false

  // 单例模式，确保整个应用只有一个WebSocket实例
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  // 私有构造函数，防止外部创建实例
  private constructor() {}
  
  // 设置是否启用模拟数据
  public setMockDataEnabled(enabled: boolean): void {
    this.enableMockData = enabled
    console.log(`Mock data generation ${enabled ? 'enabled' : 'disabled'}`)
    
    // 如果禁用模拟数据但定时器仍在运行，则停止它
    if (!enabled && this.mockInterval) {
      clearInterval(this.mockInterval)
      this.mockInterval = null
    }
    
    // 如果启用模拟数据且已连接，则开始生成模拟数据
    if (enabled && this.isConnected.value && !this.mockInterval) {
      this.startMockMessageInterval()
    }
  }

  // 连接WebSocket
  public connect(): void {
    if (this.isConnected.value) return

    console.log('WebSocket connecting...')
    
    // 模拟连接成功
    setTimeout(() => {
      this.isConnected.value = true
      console.log('WebSocket connected!')
      
      // 仅当启用了模拟数据时才启动模拟消息发送
      if (this.enableMockData) {
        this.startMockMessageInterval()
      } else {
        console.log('Mock data generation is disabled')
      }
    }, 1000)
  }

  // 断开WebSocket连接
  public disconnect(): void {
    if (!this.isConnected.value) return
    
    console.log('WebSocket disconnecting...')
    
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
      this.mockInterval = null
    }
    
    this.isConnected.value = false
    console.log('WebSocket disconnected!')
  }

  // 添加事件监听器
  public addEventListener(listener: (event: WebSocketEvent) => void): void {
    this.listeners.push(listener)
  }

  // 移除事件监听器
  public removeEventListener(listener: (event: WebSocketEvent) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 获取连接状态
  public getConnectionStatus(): boolean {
    return this.isConnected.value
  }
  
  // 获取模拟数据状态
  public getMockDataEnabled(): boolean {
    return this.enableMockData
  }

  // 发送消息
  public sendMessage(message: any): boolean {
    if (this.isConnected.value) {
      console.log('WebSocket发送消息:', message);
      
      // 捕获任何可能的错误，确保消息处理不会中断
      try {
        // 在这里应该实现真实的WebSocket发送逻辑
        // 由于我们在演示环境中没有真实的WebSocket服务器
        // 所以这里我们模拟一个本地的消息传递
        
        // 将消息存储到localStorage
        this.storeMessage(message);
        
        // 模拟消息广播 - 在500毫秒后触发事件
        setTimeout(() => {
          try {
            this.triggerEvent(message);
          } catch (error) {
            console.error('触发WebSocket事件失败:', error);
          }
        }, 500);
      } catch (error) {
        console.error('WebSocket消息处理失败:', error);
        // 即使出错，我们仍然返回true，因为消息已经存储在本地
        // 这样可以确保应用程序继续运行
      }
      
      return true;
    } else {
      console.error('WebSocket未连接，无法发送消息 - 使用本地回退方式');
      
      // 即使WebSocket未连接，我们也尝试存储消息到localStorage
      try {
        this.storeMessage(message);
        
        // 模拟消息处理
        setTimeout(() => {
          try {
            this.triggerEvent(message);
          } catch (error) {
            console.error('触发本地WebSocket事件失败:', error);
          }
        }, 500);
        
        return true; // 返回true表示我们已经使用本地方式处理了消息
      } catch (error) {
        console.error('本地消息处理失败:', error);
        return false;
      }
    }
  }
  
  // 存储消息到localStorage
  private storeMessage(message: any): void {
    if (!message) return;
    
    try {
      // 根据消息类型处理
      if (message.type === 'new_order') {
        // 保存新订单到realOrders
        const storedOrders = localStorage.getItem('realOrders');
        let orders = storedOrders ? JSON.parse(storedOrders) : [];
        
        // 确保是数组
        if (!Array.isArray(orders)) {
          orders = [];
        }
        
        // 添加新订单
        const newOrder = {
          id: message.orderId || Date.now(),
          orderNumber: message.orderNumber,
          type: message.type,
          amount: message.amount,
          customerName: '当前用户',
          customerAccount: 'customer@example.com',
          status: message.status,
          remark: message.remark || '',
          createdAt: message.timestamp || new Date().toISOString().split('T')[0],
          updatedAt: message.timestamp || new Date().toISOString().split('T')[0],
          updatedBy: '客户'
        };
        
        // 检查订单是否已存在
        const existingIndex = orders.findIndex((o: any) => o.orderNumber === message.orderNumber);
        if (existingIndex !== -1) {
          // 更新现有订单
          orders[existingIndex] = {...orders[existingIndex], ...newOrder};
        } else {
          // 添加新订单
          orders.push(newOrder);
        }
        
        // 保存回localStorage
        localStorage.setItem('realOrders', JSON.stringify(orders));
      } 
      else if (message.type === 'status_change') {
        // 更新订单状态
        const storedOrders = localStorage.getItem('realOrders');
        let orders = storedOrders ? JSON.parse(storedOrders) : [];
        
        // 确保是数组
        if (!Array.isArray(orders)) {
          return;
        }
        
        // 查找并更新订单
        const orderIndex = orders.findIndex((o: any) => o.orderNumber === message.orderNumber);
        if (orderIndex !== -1) {
          orders[orderIndex].status = message.newStatus;
          orders[orderIndex].remark = message.remark || orders[orderIndex].remark;
          orders[orderIndex].updatedAt = message.timestamp || new Date().toISOString().split('T')[0];
          orders[orderIndex].updatedBy = message.updatedBy || '系统';
          
          // 保存回localStorage
          localStorage.setItem('realOrders', JSON.stringify(orders));
        }
      }
    } catch (error) {
      console.error('存储消息到localStorage失败:', error);
    }
  }

  // 手动触发事件（用于测试或管理员操作）
  public manualTriggerEvent(event: WebSocketEvent): void {
    if (!this.isConnected.value) {
      console.warn('WebSocket is not connected!')
      return
    }
    
    this.triggerEvent(event)
  }

  // 模拟接收消息并触发事件
  private triggerEvent(event: WebSocketEvent): void {
    this.listeners.forEach(listener => listener(event))
    
    // 如果是订单状态变更或新订单，则显示通知
    if ('orderNumber' in event) {
      let title: string
      let message: string
      
      if ('oldStatus' in event) {
        // 订单状态变更
        title = `订单状态已更新`
        message = `订单 ${event.orderNumber} 状态已从 ${this.formatStatus(event.oldStatus)} 更改为 ${this.formatStatus(event.newStatus)}`
      } else {
        // 新订单
        title = `新${event.type === 'recharge' ? '充值' : '提现'}订单`
        message = `收到新订单 ${event.orderNumber}，金额: ${event.amount} 元`
      }
      
      ElNotification({
        title,
        message,
        type: 'success',
        duration: 5000
      })
    } else if (event.type === 'system') {
      // 系统通知
      ElNotification({
        title: event.title,
        message: event.message,
        type: 'info',
        duration: 6000
      })
    }
  }

  // 格式化状态文本
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'recharge_pending': '充值待处理',
      'recharge_processing': '充值处理中',
      'recharge_completed': '充值已完成',
      'recharge_failed': '充值失败',
      'withdraw_pending': '提现待处理',
      'withdraw_processing': '提现处理中',
      'withdraw_completed': '提现已完成',
      'withdraw_failed': '提现失败',
    }
    return statusMap[status] || status
  }

  // 启动模拟消息发送定时器
  private startMockMessageInterval(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
    }
    
    // 每30-60秒随机发送一个模拟事件
    this.mockInterval = window.setInterval(() => {
      if (!this.isConnected.value || !this.enableMockData) return
      
      const randomEvent = this.generateRandomEvent()
      this.triggerEvent(randomEvent)
    }, Math.random() * 30000 + 30000) // 30-60秒随机间隔
    
    // 立即发送一个系统通知，表示连接成功
    const connectEvent: SystemNotificationEvent = {
      type: 'system',
      title: '系统已连接',
      message: '实时数据同步已激活，您将收到最新的订单更新',
      timestamp: new Date().toISOString()
    }
    
    setTimeout(() => {
      this.triggerEvent(connectEvent)
    }, 2000)
  }

  // 生成随机模拟事件
  private generateRandomEvent(): WebSocketEvent {
    const eventTypes = ['status_change', 'new_order', 'system']
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const now = new Date()
    const timestamp = now.toISOString()
    
    switch (randomType) {
      case 'status_change': {
        const orderTypes = ['recharge', 'withdraw'] as const
        const type = orderTypes[Math.floor(Math.random() * orderTypes.length)]
        const statusOptions = ['pending', 'processing', 'completed', 'failed']
        
        const oldStatusIndex = Math.floor(Math.random() * 3) // 不包括最后一个状态
        const newStatusIndex = oldStatusIndex + 1 // 确保状态是"进步"的
        
        const oldStatus = `${type}_${statusOptions[oldStatusIndex]}`
        const newStatus = `${type}_${statusOptions[newStatusIndex]}`
        
        return {
          orderId: Math.floor(Math.random() * 1000) + 1,
          orderNumber: `${type.charAt(0).toUpperCase()}${now.getFullYear()}${String(1000 + Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          type,
          oldStatus,
          newStatus,
          timestamp,
          updatedBy: '管理员',
          message: '订单状态已更新'
        }
      }
      
      case 'new_order': {
        const orderTypes = ['recharge', 'withdraw'] as const
        const type = orderTypes[Math.floor(Math.random() * orderTypes.length)]
        
        return {
          orderId: Math.floor(Math.random() * 1000) + 1,
          orderNumber: `${type.charAt(0).toUpperCase()}${now.getFullYear()}${String(1000 + Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          type,
          amount: (Math.random() * 1000 + 100).toFixed(2),
          status: `${type}_pending`,
          timestamp,
          message: '新订单已创建'
        }
      }
      
      case 'system':
      default: {
        const systemMessages = [
          '系统维护将于今晚进行，预计10分钟',
          '新版本功能已上线，请查看更新日志',
          '检测到异常登录尝试，请注意账户安全',
        ]
        const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
        
        return {
          type: 'system',
          title: '系统通知',
          message: randomMessage,
          timestamp
        }
      }
    }
  }
}

// 导出单例实例
export const webSocketService = WebSocketService.getInstance() 