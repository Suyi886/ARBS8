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

  // 单例模式，确保整个应用只有一个WebSocket实例
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  // 私有构造函数，防止外部创建实例
  private constructor() {}

  // 连接WebSocket
  public connect(): void {
    if (this.isConnected.value) return

    console.log('WebSocket connecting...')
    
    // 模拟连接成功
    setTimeout(() => {
      this.isConnected.value = true
      console.log('WebSocket connected!')
      
      // 启动模拟消息发送
      this.startMockMessageInterval()
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

  // 模拟发送消息
  public sendMessage(message: any): void {
    if (!this.isConnected.value) {
      console.warn('WebSocket is not connected!')
      return
    }
    
    console.log('Message sent:', message)
    
    // 模拟服务器确认消息接收
    setTimeout(() => {
      console.log('Server acknowledged message:', message)
    }, 500)
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
      if (!this.isConnected.value) return
      
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
        const titles = ['系统通知', '维护公告', '功能更新']
        const messages = [
          '系统将于今晚23:00进行例行维护，预计1小时内完成',
          '新版本已发布，包含多项功能改进和Bug修复',
          '请注意：23:00-24:00系统将进行数据库升级，暂停服务'
        ]
        
        return {
          type: 'system',
          title: titles[Math.floor(Math.random() * titles.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp
        }
      }
    }
  }
}

// 导出单例实例
export const webSocketService = WebSocketService.getInstance() 