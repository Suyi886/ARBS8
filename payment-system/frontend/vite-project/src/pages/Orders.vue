<!-- src/pages/Orders.vue -->
<template>
  <div class="orders-container">
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="controls">
        <div class="order-type-filter">
          <button 
            :class="['filter-btn', activeTab === 'all' ? 'active' : '']" 
            @click="setActiveTab('all')">
            全部订单
          </button>
          <button 
            :class="['filter-btn', activeTab === 'recharge' ? 'active' : '']" 
            @click="setActiveTab('recharge')">
            充值订单
          </button>
          <button 
            :class="['filter-btn', activeTab === 'withdraw' ? 'active' : '']" 
            @click="setActiveTab('withdraw')">
            提现订单
          </button>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索订单号、用户..." 
            @input="filterOrders"
          />
        </div>
      </div>
    </div>

    <div class="orders-content">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>加载订单数据中...</p>
      </div>
      
      <div v-else-if="filteredOrders.length === 0" class="no-orders">
        <p>暂无订单数据</p>
      </div>
      
      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>类型</th>
            <th>金额</th>
            <th>用户</th>
            <th>账户</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :class="getOrderRowClass(order)">
            <td>{{ order.order_number }}</td>
            <td>{{ getOrderTypeText(order.type) }}</td>
            <td>¥{{ order.amount }}</td>
            <td>{{ order.customer_name || '未知用户' }}</td>
            <td>{{ order.customer_account || '-' }}</td>
            <td :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</td>
            <td>{{ formatDateTime(order.created_at) }}</td>
            <td>
              <div class="btn-group">
                <button 
                  v-if="canProcessOrder(order)" 
                  class="btn btn-primary btn-sm" 
                  @click="openOrderActionModal(order, 'approve')">
                  通过
                </button>
                <button 
                  v-if="canProcessOrder(order)" 
                  class="btn btn-danger btn-sm" 
                  @click="openOrderActionModal(order, 'reject')">
                  拒绝
                </button>
                <button 
                  class="btn btn-info btn-sm" 
                  @click="openOrderDetailsModal(order)">
                  详情
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 订单操作模态框 -->
    <div v-if="showActionModal" class="modal-overlay" @click="closeActionModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>{{ actionModalTitle }}</h3>
          <button class="close-btn" @click="closeActionModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <p><strong>订单号:</strong> {{ selectedOrder.order_number }}</p>
            <p><strong>类型:</strong> {{ getOrderTypeText(selectedOrder.type) }}</p>
            <p><strong>金额:</strong> ¥{{ selectedOrder.amount }}</p>
            <p><strong>状态:</strong> {{ getStatusText(selectedOrder.status) }}</p>
          </div>
          <div class="form-group">
            <label for="remark">备注:</label>
            <textarea 
              id="remark" 
              v-model="actionRemark" 
              rows="3" 
              placeholder="输入操作备注..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeActionModal">取消</button>
          <button 
            class="btn" 
            :class="currentAction === 'approve' ? 'btn-primary' : 'btn-danger'" 
            @click="processOrder"
          >
            {{ currentAction === 'approve' ? '确认通过' : '确认拒绝' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 订单详情模态框 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="order-details">
            <p><strong>订单号:</strong> {{ selectedOrder.order_number }}</p>
            <p><strong>类型:</strong> {{ getOrderTypeText(selectedOrder.type) }}</p>
            <p><strong>金额:</strong> ¥{{ selectedOrder.amount }}</p>
            <p><strong>用户:</strong> {{ selectedOrder.customer_name || '未知用户' }}</p>
            <p><strong>账户:</strong> {{ selectedOrder.customer_account || '-' }}</p>
            <p><strong>状态:</strong> <span :class="getStatusClass(selectedOrder.status)">{{ getStatusText(selectedOrder.status) }}</span></p>
            <p><strong>创建时间:</strong> {{ formatDateTime(selectedOrder.created_at) }}</p>
            <p><strong>更新时间:</strong> {{ formatDateTime(selectedOrder.updated_at) }}</p>
            <p><strong>更新人:</strong> {{ selectedOrder.updated_by || '-' }}</p>
            <p><strong>备注:</strong> {{ selectedOrder.remark || '无' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDetailsModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useUserStore } from '../stores/user';
import { useToast } from 'vue-toastification';

// 获取用户存储和通知工具
const userStore = useUserStore();
const toast = useToast();

// 订单相关状态
const orders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const activeTab = ref('all');

// 模态框状态
const showActionModal = ref(false);
const showDetailsModal = ref(false);
const selectedOrder = ref({});
const currentAction = ref('approve');
const actionRemark = ref('');

// WebSocket 连接
let ws = null;

// 生命周期钩子
onMounted(() => {
  fetchOrders();
  connectWebSocket();
  
  // 组件卸载时关闭WebSocket
  window.addEventListener('beforeunload', closeWebSocket);
});

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true;
  try {
    // 获取API基础URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    
    if (response.data.success) {
      orders.value = response.data.data || [];
    } else {
      toast.error('获取订单失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取订单失败:', error);
    toast.error('获取订单失败，请稍后重试');
    
    // 开发环境下使用测试数据
    if (import.meta.env.DEV) {
      // 从localStorage获取测试数据
      const testOrders = localStorage.getItem('realOrders');
      if (testOrders) {
        try {
          orders.value = JSON.parse(testOrders);
        } catch (e) {
          console.error('解析测试订单数据失败', e);
        }
      }
    }
  } finally {
    loading.value = false;
  }
};

// 设置活动标签
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// 根据活动标签和搜索条件过滤订单
const filteredOrders = computed(() => {
  let result = orders.value;
  
  // 按订单类型过滤
  if (activeTab.value !== 'all') {
    result = result.filter(order => order.type === activeTab.value);
  }
  
  // 按搜索条件过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(order => 
      (order.order_number && order.order_number.toLowerCase().includes(query)) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
      (order.customer_account && order.customer_account.toLowerCase().includes(query))
    );
  }
  
  // 按创建时间排序（最新的在前面）
  return result.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });
});

// 过滤订单（用于搜索框输入事件）
const filterOrders = () => {
  // 直接使用计算属性 filteredOrders，不需要额外操作
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateTimeStr;
  }
};

// 获取订单类型文本
const getOrderTypeText = (type) => {
  const typeMap = {
    'recharge': '充值',
    'withdraw': '提现'
  };
  return typeMap[type] || type;
};

// 获取状态描述文本
const getStatusText = (status) => {
  const statusMap = {
    'recharge_pending': '充值待处理',
    'recharge_processing': '充值处理中',
    'recharge_success': '充值成功',
    'recharge_failed': '充值失败',
    'withdraw_pending': '提现待处理',
    'withdraw_processing': '提现审核中',
    'withdraw_success': '提现成功',
    'withdraw_failed': '提现失败'
  };
  return statusMap[status] || status;
};

// 获取状态CSS类名
const getStatusClass = (status) => {
  if (status.includes('pending') || status.includes('processing')) {
    return 'status-pending';
  } else if (status.includes('success')) {
    return 'status-success';
  } else if (status.includes('failed')) {
    return 'status-failed';
  }
  return '';
};

// 获取订单行的CSS类名
const getOrderRowClass = (order) => {
  if (order.status.includes('pending')) {
    return 'row-highlight';
  }
  return '';
};

// 检查订单是否可以处理
const canProcessOrder = (order) => {
  return order.status.includes('pending');
};

// 打开订单操作模态框
const openOrderActionModal = (order, action) => {
  selectedOrder.value = { ...order };
  currentAction.value = action;
  actionRemark.value = '';
  showActionModal.value = true;
};

// 关闭订单操作模态框
const closeActionModal = () => {
  showActionModal.value = false;
};

// 打开订单详情模态框
const openOrderDetailsModal = (order) => {
  selectedOrder.value = { ...order };
  showDetailsModal.value = true;
};

// 关闭订单详情模态框
const closeDetailsModal = () => {
  showDetailsModal.value = false;
};

// 获取模态框标题
const actionModalTitle = computed(() => {
  return currentAction.value === 'approve' 
    ? `确认通过${getOrderTypeText(selectedOrder.value.type)}订单` 
    : `确认拒绝${getOrderTypeText(selectedOrder.value.type)}订单`;
});

// 处理订单
const processOrder = async () => {
  try {
    const order = selectedOrder.value;
    const newStatus = currentAction.value === 'approve'
      ? (order.type === 'recharge' ? 'recharge_success' : 'withdraw_success')
      : (order.type === 'recharge' ? 'recharge_failed' : 'withdraw_failed');
    
    // 获取API基础URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    // 发送请求更新订单状态
    const response = await axios.put(
      `${baseUrl}/api/orders/${order.order_number}/status`,
      {
        status: newStatus,
        remark: actionRemark.value
      },
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
    );
    
    if (response.data.success) {
      toast.success(`订单${currentAction.value === 'approve' ? '已通过' : '已拒绝'}`);
      
      // 更新本地订单数据
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        orders.value[index] = response.data.data;
      }
      
      // 关闭模态框
      closeActionModal();
      
      // 可选：通知游戏系统订单状态变更
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'order_status_change',
          orderNumber: order.order_number,
          oldStatus: order.status,
          newStatus: newStatus,
          timestamp: Date.now()
        }));
      }
    } else {
      toast.error('处理订单失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('处理订单失败:', error);
    toast.error('处理订单失败，请稍后重试');
    
    // 开发环境下使用本地存储模拟
    if (import.meta.env.DEV) {
      const order = selectedOrder.value;
      const newStatus = currentAction.value === 'approve'
        ? (order.type === 'recharge' ? 'recharge_success' : 'withdraw_success')
        : (order.type === 'recharge' ? 'recharge_failed' : 'withdraw_failed');
      
      // 更新本地订单
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        orders.value[index] = {
          ...order,
          status: newStatus,
          remark: actionRemark.value,
          updated_at: new Date().toISOString(),
          updated_by: userStore.user.username
        };
        
        // 更新localStorage中的测试数据
        localStorage.setItem('realOrders', JSON.stringify(orders.value));
        
        toast.success(`订单${currentAction.value === 'approve' ? '已通过' : '已拒绝'} (本地模式)`);
        closeActionModal();
      }
    }
  }
};

// 连接WebSocket
const connectWebSocket = () => {
  // 设置WebSocket URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || `${protocol}//${window.location.hostname}:3000`;
  
  try {
    // 关闭现有连接
    if (ws) {
      ws.close();
    }
    
    // 创建新连接
    ws = new WebSocket(wsBaseUrl);
    
    // 连接打开事件
    ws.onopen = () => {
      console.log('WebSocket连接已建立');
      // 可以发送认证消息
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: userStore.token,
          timestamp: Date.now()
        }));
      }
    };
    
    // 收到消息事件
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到WebSocket消息:', data);
        
        // 处理不同类型的消息
        if (data.type === 'order_notification' || data.type === 'order_update') {
          // 刷新订单列表
          fetchOrders();
          
          // 可选：显示通知
          if (data.type === 'order_notification') {
            toast.info(`收到新的${data.orderData.type === 'recharge' ? '充值' : '提现'}订单`);
          }
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    };
    
    // 连接关闭事件
    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      // 可以在这里添加重连逻辑
      setTimeout(connectWebSocket, 5000);
    };
    
    // 连接错误事件
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
  } catch (error) {
    console.error('建立WebSocket连接失败:', error);
  }
};

// 关闭WebSocket连接
const closeWebSocket = () => {
  if (ws) {
    ws.close();
  }
};
</script>

<style scoped>
.orders-container {
  padding: 20px;
  max-width: 100%;
  overflow-x: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.order-type-filter {
  display: flex;
  gap: 5px;
}

.filter-btn {
  padding: 8px 15px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

.search-box input {
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th, .orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.orders-table tr:hover {
  background-color: #f5f5f5;
}

.row-highlight {
  background-color: #fffbde;
}

.btn-group {
  display: flex;
  gap: 5px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:hover {
  opacity: 0.85;
}

.status-pending {
  color: #ff9800;
  font-weight: 500;
}

.status-success {
  color: #4caf50;
  font-weight: 500;
}

.status-failed {
  color: #f44336;
  font-weight: 500;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-orders {
  padding: 40px;
  text-align: center;
  color: #666;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-top: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.order-info p, .order-details p {
  margin: 8px 0;
}
</style>
  