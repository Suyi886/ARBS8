<template>
  <div class="messages-page">
    <div class="page-header">
      <h2>消息中心</h2>
      <div class="header-actions">
        <el-button @click="refreshMessages">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="markAllAsRead">
          <el-icon><Check /></el-icon>
          全部标为已读
        </el-button>
      </div>
    </div>
    
    <div class="message-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部消息" name="all">
          <div class="message-filter">
            <el-radio-group v-model="filter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="unread">未读</el-radio-button>
              <el-radio-button label="read">已读</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="message-list" v-loading="loading">
            <template v-if="filteredMessages.length > 0">
              <div 
                v-for="message in filteredMessages" 
                :key="message.id"
                :class="['message-item', {'unread': !message.read}]"
                @click="viewMessageDetail(message)"
              >
                <div class="message-dot" v-if="!message.read"></div>
                <el-icon class="message-icon" :class="message.type">
                  <component :is="getMessageIcon(message.type)" />
                </el-icon>
                <div class="message-content">
                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-preview">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
                <div class="message-actions">
                  <el-button 
                    v-if="!message.read" 
                    size="small" 
                    type="primary" 
                    text
                    @click.stop="markAsRead(message)"
                  >
                    标为已读
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    text
                    @click.stop="deleteMessage(message)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无消息" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="系统通知" name="system">
          <div class="message-list" v-loading="loading">
            <template v-if="systemMessages.length > 0">
              <div 
                v-for="message in systemMessages" 
                :key="message.id"
                :class="['message-item', {'unread': !message.read}]"
                @click="viewMessageDetail(message)"
              >
                <div class="message-dot" v-if="!message.read"></div>
                <el-icon class="message-icon system">
                  <Bell />
                </el-icon>
                <div class="message-content">
                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-preview">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
                <div class="message-actions">
                  <el-button 
                    v-if="!message.read" 
                    size="small" 
                    type="primary" 
                    text
                    @click.stop="markAsRead(message)"
                  >
                    标为已读
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    text
                    @click.stop="deleteMessage(message)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无系统通知" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="订单通知" name="order">
          <div class="message-list" v-loading="loading">
            <template v-if="orderMessages.length > 0">
              <div 
                v-for="message in orderMessages" 
                :key="message.id"
                :class="['message-item', {'unread': !message.read}]"
                @click="viewMessageDetail(message)"
              >
                <div class="message-dot" v-if="!message.read"></div>
                <el-icon class="message-icon order">
                  <component :is="message.orderType === 'recharge' ? 'Money' : 'Wallet'" />
                </el-icon>
                <div class="message-content">
                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-preview">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
                <div class="message-actions">
                  <el-button 
                    v-if="message.orderNumber"
                    size="small" 
                    type="success" 
                    text
                    @click.stop="viewOrder(message.orderNumber)"
                  >
                    查看订单
                  </el-button>
                  <el-button 
                    v-if="!message.read" 
                    size="small" 
                    type="primary" 
                    text
                    @click.stop="markAsRead(message)"
                  >
                    标为已读
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    text
                    @click.stop="deleteMessage(message)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无订单通知" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="detailDialog.message?.title || '消息详情'"
      width="600px"
    >
      <div class="message-detail">
        <div class="message-meta">
          <div class="message-time">{{ formatTime(detailDialog.message?.time) }}</div>
          <div class="message-status">
            <el-tag size="small" :type="detailDialog.message?.read ? 'info' : 'warning'">
              {{ detailDialog.message?.read ? '已读' : '未读' }}
            </el-tag>
          </div>
        </div>
        
        <div class="message-body">
          {{ detailDialog.message?.content }}
        </div>
        
        <div v-if="detailDialog.message?.orderNumber" class="message-related">
          <div class="related-title">相关订单</div>
          <div class="related-content">
            <span class="order-number">{{ detailDialog.message.orderNumber }}</span>
            <el-button 
              type="primary" 
              link 
              @click="viewOrder(detailDialog.message.orderNumber)"
            >
              查看订单
            </el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
          <el-button 
            v-if="!detailDialog.message?.read" 
            type="primary" 
            @click="markDetailAsRead"
          >
            标为已读
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Refresh, 
  Check, 
  Bell, 
  Money, 
  Wallet, 
  Message, 
  InfoFilled 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { webSocketService, type WebSocketEvent } from '@/utils/websocket';

interface MessageItem {
  id: number;
  type: 'system' | 'order';
  title: string;
  content: string;
  time: Date;
  read: boolean;
  orderNumber?: string;
  orderType?: 'recharge' | 'withdraw';
}

const router = useRouter();
const loading = ref(false);
const activeTab = ref('all');
const filter = ref('all');
const messages = ref<MessageItem[]>([]);
const detailDialog = ref({
  visible: false,
  message: null as MessageItem | null
});

// 模拟获取消息数据
const fetchMessages = async () => {
  loading.value = true;
  
  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 创建模拟消息数据
    const mockMessages: MessageItem[] = [
      {
        id: 1,
        type: 'system',
        title: '系统维护通知',
        content: '尊敬的用户，系统将于2024年3月5日凌晨2:00-4:00进行维护，届时部分功能可能无法使用。给您带来的不便，敬请谅解。',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true
      },
      {
        id: 2,
        type: 'order',
        title: '充值订单状态更新',
        content: '您的充值订单 R202403010001 已完成处理，金额 1000.00 元已入账。',
        time: new Date(Date.now() - 12 * 60 * 60 * 1000),
        read: false,
        orderNumber: 'R202403010001',
        orderType: 'recharge'
      },
      {
        id: 3,
        type: 'order',
        title: '提现订单已提交',
        content: '您的提现订单 W202403020002 已提交，金额 500.00 元，正在处理中。',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        orderNumber: 'W202403020002',
        orderType: 'withdraw'
      },
      {
        id: 4,
        type: 'system',
        title: '账户安全提醒',
        content: '我们检测到您的账户在新设备上登录，如非您本人操作，请立即修改密码。',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      },
      {
        id: 5,
        type: 'order',
        title: '提现订单状态更新',
        content: '您的提现订单 W202403010003 已完成处理，金额 1500.00 元已转入您的银行账户。',
        time: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        orderNumber: 'W202403010003',
        orderType: 'withdraw'
      }
    ];
    
    messages.value = mockMessages;
  } catch (error) {
    console.error('获取消息失败:', error);
    ElMessage.error('获取消息失败，请重试');
  } finally {
    loading.value = false;
  }
};

// WebSocket事件处理
const handleWebSocketEvent = (event: WebSocketEvent) => {
  // 添加新消息
  let newMessage: MessageItem | null = null;
  
  if ('orderNumber' in event) {
    // 订单相关消息
    if ('oldStatus' in event) {
      // 订单状态变更
      const statusChangedMessage: MessageItem = {
        id: Date.now(),
        type: 'order',
        title: `${event.type === 'recharge' ? '充值' : '提现'}订单状态更新`,
        content: `您的${event.type === 'recharge' ? '充值' : '提现'}订单 ${event.orderNumber} 状态已更新为 ${formatStatus(event.newStatus)}`,
        time: new Date(),
        read: false,
        orderNumber: event.orderNumber,
        orderType: event.type
      };
      newMessage = statusChangedMessage;
    } else {
      // 新订单
      const newOrderMessage: MessageItem = {
        id: Date.now(),
        type: 'order',
        title: `新${event.type === 'recharge' ? '充值' : '提现'}订单`,
        content: `您的${event.type === 'recharge' ? '充值' : '提现'}订单 ${event.orderNumber} 已提交，金额 ${event.amount} 元`,
        time: new Date(),
        read: false,
        orderNumber: event.orderNumber,
        orderType: event.type
      };
      newMessage = newOrderMessage;
    }
  } else if (event.type === 'system') {
    // 系统通知
    const systemMessage: MessageItem = {
      id: Date.now(),
      type: 'system',
      title: event.title,
      content: event.message,
      time: new Date(),
      read: false
    };
    newMessage = systemMessage;
  }
  
  // 添加到消息列表
  if (newMessage) {
    messages.value = [newMessage, ...messages.value];
    
    // 更新未读消息数量
    updateUnreadCount();
  }
};

// 计算属性：根据筛选条件过滤消息
const filteredMessages = computed(() => {
  let result = messages.value;
  
  // 根据已读/未读状态筛选
  if (filter.value === 'read') {
    result = result.filter(message => message.read);
  } else if (filter.value === 'unread') {
    result = result.filter(message => !message.read);
  }
  
  // 根据当前标签页类型筛选
  if (activeTab.value === 'system') {
    result = result.filter(message => message.type === 'system');
  } else if (activeTab.value === 'order') {
    result = result.filter(message => message.type === 'order');
  }
  
  // 按时间排序，最新的在前面
  return result.sort((a, b) => b.time.getTime() - a.time.getTime());
});

// 系统消息
const systemMessages = computed(() => {
  return messages.value
    .filter(message => message.type === 'system')
    .sort((a, b) => b.time.getTime() - a.time.getTime());
});

// 订单消息
const orderMessages = computed(() => {
  return messages.value
    .filter(message => message.type === 'order')
    .sort((a, b) => b.time.getTime() - a.time.getTime());
});

// 未读消息数量
const unreadCount = computed(() => {
  return messages.value.filter(message => !message.read).length;
});

// 更新导航菜单中的未读消息数量
const updateUnreadCount = () => {
  // 实际项目中可能需要更新全局状态或通过事件通知父组件
  console.log('未读消息数量:', unreadCount.value);
};

// 获取消息图标
const getMessageIcon = (type: string) => {
  if (type === 'system') return Bell;
  return Message;
};

// 格式化时间
const formatTime = (time?: Date) => {
  if (!time) return '';
  
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  
  // 不到1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 不到1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 不到24小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 不到7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 超过7天显示具体日期
  return time.toLocaleDateString();
};

// 格式化订单状态
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'recharge_pending': '充值待处理',
    'recharge_processing': '充值处理中',
    'recharge_completed': '充值已完成',
    'recharge_failed': '充值失败',
    'withdraw_pending': '提现待处理',
    'withdraw_processing': '提现处理中',
    'withdraw_completed': '提现已完成',
    'withdraw_failed': '提现失败',
  };
  return statusMap[status] || status;
};

// 查看消息详情
const viewMessageDetail = (message: MessageItem) => {
  detailDialog.value.message = message;
  detailDialog.value.visible = true;
  
  // 如果是未读消息，显示后标记为已读
  if (!message.read) {
    setTimeout(() => {
      markAsRead(message);
    }, 500);
  }
};

// 标记消息为已读
const markAsRead = (message: MessageItem) => {
  message.read = true;
  ElMessage.success('已标记为已读');
  updateUnreadCount();
};

// 标记详情对话框中的消息为已读
const markDetailAsRead = () => {
  if (detailDialog.value.message) {
    markAsRead(detailDialog.value.message);
  }
};

// 标记所有消息为已读
const markAllAsRead = () => {
  if (messages.value.some(message => !message.read)) {
    ElMessageBox.confirm(
      '确定要将所有消息标记为已读吗？',
      '标记为已读',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      messages.value.forEach(message => {
        message.read = true;
      });
      ElMessage.success('已将所有消息标记为已读');
      updateUnreadCount();
    }).catch(() => {});
  } else {
    ElMessage.info('没有未读消息');
  }
};

// 删除消息
const deleteMessage = (message: MessageItem) => {
  ElMessageBox.confirm(
    '确定要删除这条消息吗？',
    '删除消息',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = messages.value.findIndex(m => m.id === message.id);
    if (index !== -1) {
      messages.value.splice(index, 1);
      ElMessage.success('消息已删除');
      
      // 如果正在查看的消息被删除，关闭详情对话框
      if (detailDialog.value.visible && detailDialog.value.message?.id === message.id) {
        detailDialog.value.visible = false;
      }
      
      updateUnreadCount();
    }
  }).catch(() => {});
};

// 刷新消息
const refreshMessages = () => {
  fetchMessages();
};

// 查看订单
const viewOrder = (orderNumber: string) => {
  // 关闭详情对话框
  detailDialog.value.visible = false;
  
  // 跳转到订单查看页面
  router.push('/client/orders');
  
  // 实际项目中应该根据订单号自动选择对应的订单类型标签页，
  // 并自动定位到对应的订单
  ElMessage.info(`查看订单：${orderNumber}`);
};

// 生命周期钩子
onMounted(() => {
  fetchMessages();
  
  // 添加WebSocket事件监听
  webSocketService.addEventListener(handleWebSocketEvent);
});

onUnmounted(() => {
  // 移除WebSocket事件监听
  webSocketService.removeEventListener(handleWebSocketEvent);
});
</script>

<style scoped>
.messages-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.message-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.message-filter {
  margin-bottom: 20px;
}

.message-list {
  min-height: 300px;
}

.message-item {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.3s;
}

.message-item:hover {
  background-color: #f8f9fa;
}

.message-item.unread {
  background-color: #f0f9ff;
}

.message-dot {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.message-icon {
  font-size: 24px;
  color: #909399;
  margin-right: 16px;
  margin-top: 4px;
}

.message-icon.system {
  color: #e6a23c;
}

.message-icon.order {
  color: #409eff;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #303133;
}

.message-preview {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

/* 消息详情样式 */
.message-detail {
  padding: 10px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.message-body {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 24px;
  white-space: pre-line;
}

.message-related {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-top: 20px;
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.related-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-number {
  font-family: monospace;
  font-size: 16px;
  color: #1976d2;
}

@media (max-width: 768px) {
  .message-actions {
    opacity: 1;
  }
  
  .message-item {
    flex-direction: column;
    padding: 12px;
  }
  
  .message-icon {
    margin-bottom: 8px;
  }
  
  .message-actions {
    margin-top: 8px;
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 