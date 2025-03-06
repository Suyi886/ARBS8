<template>
  <div class="order-management">
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="订单类型">
          <el-select v-model="filters.orderType" placeholder="选择订单类型">
            <el-option label="充值订单" value="recharge" />
            <el-option label="提现订单" value="withdraw" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="选择状态">
            <el-option label="全部" value="" />
            <el-option v-for="status in getStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="订单号">
          <el-input v-model="filters.orderNumber" placeholder="输入订单号" clearable />
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Delete /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      v-loading="loading"
      :data="orders"
      border
      stripe
      style="width: 100%"
      max-height="650"
    >
      <el-table-column prop="orderNumber" label="订单号" width="180" />
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="scope">
          <span>{{ scope.row.amount }} 元</span>
        </template>
      </el-table-column>
      <el-table-column prop="customerName" label="客户名称" width="150" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button-group>
            <el-button 
              size="small" 
              type="primary" 
              @click="openStatusChangeDialog(scope.row)"
            >
              修改状态
            </el-button>
            <el-button 
              size="small" 
              type="info" 
              @click="viewOrderDetails(scope.row)"
            >
              查看详情
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalOrders"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 修改状态对话框 -->
    <el-dialog
      v-model="statusDialog.visible"
      title="修改订单状态"
      width="500px"
    >
      <div class="status-form">
        <el-form label-width="100px">
          <el-form-item label="当前状态">
            <el-tag :type="getStatusType(statusDialog.currentStatus)">
              {{ getStatusLabel(statusDialog.currentStatus) }}
            </el-tag>
          </el-form-item>
          
          <el-form-item label="新状态">
            <el-select v-model="statusDialog.newStatus" placeholder="选择新状态">
              <el-option 
                v-for="status in getStatusOptions" 
                :key="status.value" 
                :label="status.label" 
                :value="status.value" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="statusDialog.remark"
              type="textarea"
              rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleStatusChange" :loading="statusDialog.loading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="订单详情"
      width="600px"
    >
      <el-descriptions border :column="1" direction="vertical">
        <el-descriptions-item label="订单号">{{ detailDialog.order?.orderNumber }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">{{ detailDialog.order?.type === 'recharge' ? '充值订单' : '提现订单' }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detailDialog.order?.amount }} 元</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ detailDialog.order?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户账号">{{ detailDialog.order?.customerAccount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailDialog.order?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailDialog.order?.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailDialog.order?.status)">
            {{ getStatusLabel(detailDialog.order?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailDialog.order?.updatedBy }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailDialog.order?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  Download, 
  Refresh, 
  Search, 
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { webSocketService } from '@/utils/websocket'

// 模拟后端API调用
const mockFetchOrders = async (params: any) => {
  console.log('Fetching orders with params:', params)
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟数据
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
  
  // 根据过滤条件生成随机数据
  const mockData = Array.from({ length: 20 }, (_, i) => {
    const isRecharge = params.orderType === 'recharge' || (params.orderType === '' && Math.random() > 0.5)
    const type = isRecharge ? 'recharge' : 'withdraw'
    const statusPrefix = isRecharge ? 'recharge_' : 'withdraw_'
    const statusOptions = ['pending', 'processing', 'completed', 'failed']
    const statusSuffix = params.status && params.status.endsWith(params.status) 
      ? params.status.split('_')[1] 
      : statusOptions[Math.floor(Math.random() * statusOptions.length)]
    
    return {
      id: i + 1,
      orderNumber: `${type.charAt(0).toUpperCase()}${new Date().getFullYear()}${String(1000 + i).padStart(4, '0')}`,
      type,
      amount: (Math.random() * 1000 + 100).toFixed(2),
      customerName: `客户${i + 1}`,
      customerAccount: `account${i + 1}@example.com`,
      status: `${statusPrefix}${statusSuffix}`,
      remark: Math.random() > 0.7 ? `这是订单${i + 1}的备注信息` : '',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: '管理员'
    }
  })
  
  // 如果有订单号搜索，只返回匹配的订单
  const filteredData = params.orderNumber 
    ? mockData.filter(order => order.orderNumber.includes(params.orderNumber))
    : mockData
    
  // 模拟分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const paginatedData = filteredData.slice(start, end)
  
  return {
    orders: paginatedData,
    total: filteredData.length
  }
}

// 模拟修改订单状态
const mockUpdateOrderStatus = async (orderId: number, orderNumber: string, type: string, oldStatus: string, newStatus: string, remark: string) => {
  console.log(`Updating order ${orderId} to status ${newStatus} with remark ${remark}`)
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 通过WebSocket通知客户
  if (webSocketService.getConnectionStatus()) {
    webSocketService.sendMessage({
      type: 'status_change',
      orderId,
      orderNumber,
      type,
      oldStatus,
      newStatus,
      remark,
      updatedBy: '管理员',
      timestamp: new Date().toISOString()
    })
  }
  
  // 模拟成功响应
  return { success: true }
}

// 状态和页面数据
const loading = ref(false)
const orders = ref<any[]>([])
const totalOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤条件
const filters = reactive({
  orderType: 'recharge', // 默认显示充值订单
  status: '',
  orderNumber: '',
  dateRange: []
})

// 状态修改对话框
const statusDialog = reactive({
  visible: false,
  orderId: 0,
  orderNumber: '',
  type: '',
  currentStatus: '',
  newStatus: '',
  remark: '',
  loading: false
})

// 详情对话框
const detailDialog = reactive({
  visible: false,
  order: null as any
})

// WebSocket事件处理
const handleWebSocketEvent = (event: any) => {
  if ('orderNumber' in event) {
    // 如果是订单状态变更事件，自动刷新订单列表
    if ('oldStatus' in event) {
      refreshData()
    }
    // 如果是新订单事件，也刷新列表
    else {
      refreshData()
    }
  }
}

// 计算属性：根据订单类型获取状态选项
const getStatusOptions = computed(() => {
  if (filters.orderType === 'recharge') {
    return [
      { label: '充值待处理', value: 'recharge_pending' },
      { label: '充值处理中', value: 'recharge_processing' },
      { label: '充值已完成', value: 'recharge_completed' },
      { label: '充值失败', value: 'recharge_failed' }
    ]
  } else {
    return [
      { label: '提现待处理', value: 'withdraw_pending' },
      { label: '提现处理中', value: 'withdraw_processing' },
      { label: '提现已完成', value: 'withdraw_completed' },
      { label: '提现失败', value: 'withdraw_failed' }
    ]
  }
})

// 根据状态获取显示标签
const getStatusLabel = (status: string) => {
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

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  if (status?.includes('completed')) return 'success'
  if (status?.includes('processing')) return 'warning'
  if (status?.includes('pending')) return 'info'
  if (status?.includes('failed')) return 'danger'
  return 'info'
}

// 生命周期钩子
onMounted(() => {
  fetchOrders()
  
  // 添加WebSocket事件监听
  webSocketService.addEventListener(handleWebSocketEvent)
})

onUnmounted(() => {
  // 移除WebSocket事件监听
  webSocketService.removeEventListener(handleWebSocketEvent)
})

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true
  try {
    const { orders: data, total } = await mockFetchOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
      orderType: filters.orderType,
      status: filters.status,
      orderNumber: filters.orderNumber,
      dateRange: filters.dateRange
    })
    orders.value = data
    totalOrders.value = total
  } catch (error) {
    console.error('获取订单失败:', error)
    ElMessage.error('获取订单数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchOrders()
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchOrders()
}

// 重置过滤条件
const resetFilters = () => {
  filters.orderType = 'recharge'
  filters.status = ''
  filters.orderNumber = ''
  filters.dateRange = []
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchOrders()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}

// 打开状态修改对话框
const openStatusChangeDialog = (row: any) => {
  statusDialog.orderId = row.id
  statusDialog.orderNumber = row.orderNumber
  statusDialog.type = row.type
  statusDialog.currentStatus = row.status
  statusDialog.newStatus = ''
  statusDialog.remark = row.remark || ''
  statusDialog.visible = true
}

// 处理状态修改
const handleStatusChange = async () => {
  if (!statusDialog.newStatus) {
    ElMessage.warning('请选择新状态')
    return
  }
  
  statusDialog.loading = true
  try {
    const result = await mockUpdateOrderStatus(
      statusDialog.orderId,
      statusDialog.orderNumber,
      statusDialog.type,
      statusDialog.currentStatus,
      statusDialog.newStatus,
      statusDialog.remark
    )
    
    if (result.success) {
      ElMessage.success('订单状态更新成功')
      statusDialog.visible = false
      fetchOrders() // 刷新订单列表
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败，请重试')
  } finally {
    statusDialog.loading = false
  }
}

// 查看订单详情
const viewOrderDetails = (row: any) => {
  detailDialog.order = { ...row }
  detailDialog.visible = true
}

// 导出数据
const exportData = () => {
  ElMessageBox.confirm(
    '确定要导出当前筛选条件下的所有订单数据吗？',
    '导出数据',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: '数据导出成功，请在下载中心查看'
    })
  }).catch(() => {})
}
</script>

<style scoped>
.order-management {
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

.filter-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-form {
  padding: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-form {
    display: flex;
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }
}
</style> 