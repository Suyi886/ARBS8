<template>
  <div class="order-management">
    <div class="page-header">
      <div class="header-title">
        <h2>订单管理</h2>
        <div v-if="currentCustomer" class="current-customer-info">
          <el-tag type="info" effect="plain" class="customer-tag">
            <el-icon><User /></el-icon>
            当前客户: {{ currentCustomer.name }}
          </el-tag>
          <el-button link type="primary" @click="clearCustomerFilter">
            <el-icon><Close /></el-icon>
            清除客户筛选
          </el-button>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="addTestOrder">
          <el-icon><Plus /></el-icon>
          添加测试订单
        </el-button>
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
    
    <!-- 订单类型选项卡 -->
    <el-tabs v-model="activeOrderTab" class="order-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="充值订单" name="recharge">
        <div class="filter-section">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="订单状态">
              <el-select v-model="filters.status" placeholder="选择状态">
                <el-option label="全部" value="" />
                <el-option v-for="status in getStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="订单号">
              <el-input v-model="filters.orderNumber" placeholder="输入订单号" clearable />
            </el-form-item>
            
            <el-form-item label="客户">
              <el-select 
                v-model="filters.customerId" 
                placeholder="选择客户" 
                clearable
                filterable
              >
                <el-option label="全部客户" value="" />
                <el-option 
                  v-for="customer in customerOptions" 
                  :key="customer.id" 
                  :label="customer.name" 
                  :value="customer.id" 
                />
              </el-select>
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
          :data="filteredOrders"
          border
          stripe
          style="width: 100%"
          max-height="650"
        >
          <el-table-column prop="orderNumber" label="订单号" width="170" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'recharge' ? 'success' : 'warning'">
                {{ row.type === 'recharge' ? '充值' : '提现' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="customerId" label="客户" width="120">
            <template #default="{ row }">
              <el-link type="primary" @click="viewCustomer(row.customerId)">
                {{ getCustomerName(row.customerId) }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="scope">
              <span>{{ scope.row.amount }} 元</span>
            </template>
          </el-table-column>
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
                  详情
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalFilteredOrders"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="提现订单" name="withdraw">
        <div class="filter-section">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="订单状态">
              <el-select v-model="filters.status" placeholder="选择状态">
                <el-option label="全部" value="" />
                <el-option v-for="status in getStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="订单号">
              <el-input v-model="filters.orderNumber" placeholder="输入订单号" clearable />
            </el-form-item>
            
            <el-form-item label="客户">
              <el-select 
                v-model="filters.customerId" 
                placeholder="选择客户" 
                clearable
                filterable
              >
                <el-option label="全部客户" value="" />
                <el-option 
                  v-for="customer in customerOptions" 
                  :key="customer.id" 
                  :label="customer.name" 
                  :value="customer.id" 
                />
              </el-select>
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
          :data="filteredOrders"
          border
          stripe
          style="width: 100%"
          max-height="650"
        >
          <el-table-column prop="orderNumber" label="订单号" width="170" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'recharge' ? 'success' : 'warning'">
                {{ row.type === 'recharge' ? '充值' : '提现' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="customerId" label="客户" width="120">
            <template #default="{ row }">
              <el-link type="primary" @click="viewCustomer(row.customerId)">
                {{ getCustomerName(row.customerId) }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="scope">
              <span>{{ scope.row.amount }} 元</span>
            </template>
          </el-table-column>
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
                  详情
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalFilteredOrders"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 状态修改对话框 -->
    <el-dialog
      v-model="statusDialog.visible"
      :title="`修改订单状态 - ${statusDialog.orderNumber}`"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(statusDialog.currentStatus)">
            {{ getStatusLabel(statusDialog.currentStatus) }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="新状态">
          <el-select v-model="statusDialog.newStatus" placeholder="选择新状态">
            <el-option
              v-for="status in statusDialog.availableStatuses"
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
            placeholder="请输入状态变更的原因或备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialog.visible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmStatusChange" 
            :loading="statusDialog.loading"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="`订单详情 - ${detailDialog.order?.orderNumber}`"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detailDialog.order?.orderNumber }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          {{ detailDialog.order?.type === 'recharge' ? '充值' : '提现' }}
        </el-descriptions-item>
        <el-descriptions-item label="金额">{{ detailDialog.order?.amount }} 元</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailDialog.order?.status)">
            {{ getStatusLabel(detailDialog.order?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ detailDialog.order?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户账号">{{ detailDialog.order?.customerAccount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailDialog.order?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ detailDialog.order?.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detailDialog.order?.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 支付凭证或身份证明 -->
      <div v-if="detailDialog.order?.type === 'recharge' && detailDialog.order?.paymentProof" class="proof-section">
        <h3>支付凭证</h3>
        <div class="proof-image-container">
          <el-image 
            :src="detailDialog.order.paymentProof" 
            :preview-src-list="[detailDialog.order.paymentProof]"
            fit="contain"
            class="proof-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <div>图片加载失败</div>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      
      <div v-if="detailDialog.order?.type === 'withdraw' && detailDialog.order?.idProof" class="proof-section">
        <h3>身份证明</h3>
        <div class="proof-image-container">
          <el-image 
            :src="detailDialog.order.idProof" 
            :preview-src-list="[detailDialog.order.idProof]"
            fit="contain"
            class="proof-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <div>图片加载失败</div>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="openStatusChangeDialog(detailDialog.order)"
          >
            修改状态
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Download, 
  Refresh, 
  Search, 
  Delete,
  Plus,
  Picture,
  User,
  Close
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { webSocketService } from '@/utils/websocket'
import { useRouter, useRoute } from 'vue-router'

// 路由相关
const router = useRouter()
const route = useRoute()

// 状态和页面数据
const loading = ref(false)
const orders = ref<any[]>([])
const totalOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeOrderTab = ref('recharge') // 当前选中的订单类型选项卡

// 筛选条件
const filters = reactive({
  status: '',
  orderNumber: '',
  dateRange: [] as string[],
  customerId: ''
})

// 状态修改对话框
const statusDialog = reactive({
  visible: false,
  orderNumber: '',
  currentStatus: '',
  newStatus: '',
  remark: '',
  loading: false,
  availableStatuses: [] as {value: string, label: string}[]
})

// 订单详情对话框
const detailDialog = reactive({
  visible: false,
  order: null as any
})

// 当前选中的订单
const selectedOrder = ref<any>(null)

// WebSocket事件处理
const handleWebSocketEvent = (event: any) => {
  if ('orderNumber' in event) {
    // 如果是订单状态变更事件
    if ('oldStatus' in event) {
      // 更新本地订单状态
      updateRealOrderStatus(event)
    }
    // 如果是新订单事件，添加到真实订单列表
    else {
      addRealOrder(event)
    }
    // 刷新订单列表
    refreshData()
  }
}

// 添加真实订单到本地存储
const addRealOrder = (orderData: any) => {
  const storedOrders = localStorage.getItem('realOrders')
  let realOrders = storedOrders ? JSON.parse(storedOrders) : []
  
  // 确保是数组
  if (!Array.isArray(realOrders)) {
    realOrders = []
  }
  
  // 生成唯一ID
  const newId = realOrders.length > 0 
    ? Math.max(...realOrders.map((o: {id: number}) => o.id)) + 1 
    : 1
  
  // 创建新订单对象
  const newOrder = {
    id: newId,
    orderNumber: orderData.orderNumber,
    type: orderData.type || 'withdraw', // 默认为提现订单
    amount: orderData.amount || '500.00',
    customerName: orderData.customerName || '客户',
    customerAccount: orderData.customerAccount || 'account@example.com',
    status: orderData.status || 'withdraw_pending',
    remark: orderData.remark || '',
    createdAt: orderData.timestamp || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: '客户'
  }
  
  // 添加到订单列表
  realOrders.push(newOrder)
  
  // 保存到本地存储
  localStorage.setItem('realOrders', JSON.stringify(realOrders))
  
  // 显示通知
  ElMessage.success(`收到新的${newOrder.type === 'recharge' ? '充值' : '提现'}订单: ${newOrder.orderNumber}`)
}

// 更新本地订单状态
const updateRealOrderStatus = (event: any) => {
  const storedOrders = localStorage.getItem('realOrders')
  let realOrders = storedOrders ? JSON.parse(storedOrders) : []
  
  // 确保是数组
  if (!Array.isArray(realOrders)) {
    realOrders = []
    return
  }
  
  // 查找并更新订单
  const orderIndex = realOrders.findIndex((order: any) => 
    order.orderNumber === event.orderNumber
  )
  
  if (orderIndex !== -1) {
    realOrders[orderIndex].status = event.newStatus
    realOrders[orderIndex].remark = event.remark || realOrders[orderIndex].remark
    realOrders[orderIndex].updatedAt = event.timestamp || new Date().toISOString().split('T')[0]
    realOrders[orderIndex].updatedBy = event.updatedBy || '系统'
    
    // 保存到本地存储
    localStorage.setItem('realOrders', JSON.stringify(realOrders))
    
    // 显示通知
    ElMessage.success(`订单 ${event.orderNumber} 状态已更新为: ${getStatusLabel(event.newStatus)}`)
  }
}

// 计算属性：根据订单类型获取状态选项
const getStatusOptions = computed(() => {
  if (activeOrderTab.value === 'recharge') {
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

// 计算属性：当前筛选后的订单
const filteredOrders = computed(() => {
  if (!orders.value) return []
  
  return orders.value.filter((order: any) => {
    // 根据当前选项卡筛选订单类型
    if (activeOrderTab.value !== 'all' && order.type !== activeOrderTab.value) {
      return false
    }
    
    // 订单状态筛选
    if (filters.status && !order.status.includes(filters.status)) {
      return false
    }
    
    // 订单号筛选
    if (filters.orderNumber && !order.orderNumber.includes(filters.orderNumber)) {
      return false
    }
    
    // 客户ID筛选
    if (filters.customerId && order.customerId !== filters.customerId) {
      return false
    }
    
    // 日期范围筛选
    if (filters.dateRange && filters.dateRange.length === 2) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
      const startDate = filters.dateRange[0]
      const endDate = filters.dateRange[1]
      if (orderDate < startDate || orderDate > endDate) {
        return false
      }
    }
    
    return true
  })
})

// 计算属性：当前筛选后的订单总数
const totalFilteredOrders = computed(() => {
  const filtered = orders.value.filter(order => 
    order.type === activeOrderTab.value &&
    (filters.status ? order.status === filters.status : true)
  )
  return filtered.length
})

// 处理选项卡切换
const handleTabChange = (tab: string) => {
  activeOrderTab.value = tab
  filters.status = '' // 重置状态筛选
  fetchOrders()
}

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

// 获取可用的状态选项
const getAvailableStatusOptions = (currentStatus: string) => {
  const type = currentStatus.split('_')[0]
  
  if (type === 'recharge') {
    return [
      { label: '充值处理中', value: 'recharge_processing' },
      { label: '充值已完成', value: 'recharge_completed' },
      { label: '充值失败', value: 'recharge_failed' }
    ]
  } else {
    return [
      { label: '提现处理中', value: 'withdraw_processing' },
      { label: '提现已完成', value: 'withdraw_completed' },
      { label: '提现失败', value: 'withdraw_failed' }
    ]
  }
}

// 客户选项数据
const customerOptions = ref<{ id: string; name: string }[]>([])

// 当前选中的客户
const currentCustomer = computed(() => {
  if (!filters.customerId) return null
  return customerOptions.value.find(customer => customer.id === filters.customerId) || null
})

// 生命周期钩子
onMounted(() => {
  // 从URL获取客户ID参数
  const customerId = route.query.customerId as string
  const customerName = route.query.customerName as string
  
  if (customerId) {
    filters.customerId = customerId
    // 如果URL中有客户名称，添加到客户选项中
    if (customerName) {
      customerOptions.value = [{
        id: customerId,
        name: customerName
      }]
    }
  }
  
  // 加载数据
  fetchOrders()
  loadCustomerOptions()
  
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
    // 从fetchOrderData获取订单数据
    const data = fetchOrderData()
    orders.value = data
  } catch (error) {
    console.error('加载订单数据失败:', error)
    ElMessage.error('加载订单数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchOrders()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  
  // 更新URL，支持分享筛选结果
  if (filters.customerId) {
    const customerName = customerOptions.value.find(c => c.id === filters.customerId)?.name
    router.replace({
      query: { 
        ...route.query, 
        customerId: filters.customerId,
        customerName: customerName
      }
    })
  }
}

// 重置过滤条件
const resetFilters = () => {
  filters.status = ''
  filters.orderNumber = ''
  filters.dateRange = []
  filters.customerId = ''
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
const openStatusChangeDialog = (order: any) => {
  if (!order) return
  
  selectedOrder.value = order
  statusDialog.orderNumber = order.orderNumber
  statusDialog.currentStatus = order.status
  statusDialog.newStatus = order.status
  statusDialog.remark = order.remark || ''
  
  // 根据当前状态设置可用的状态选项
  statusDialog.availableStatuses = getAvailableStatusOptions(order.status)
  
  statusDialog.visible = true
}

// 表单提交状态更改
const handleConfirmStatusChange = async () => {
  // 验证是否选择了新状态
  if (!statusDialog.newStatus) {
    ElMessage.warning('请选择新的订单状态')
    return
  }
  
  try {
    statusDialog.loading = true
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 更新本地数据
    if (selectedOrder.value) {
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id)
      if (orderIndex !== -1) {
        // 更新订单状态
        orders.value[orderIndex].status = statusDialog.newStatus
        
        // 如果有备注，也更新备注
        if (statusDialog.remark) {
          orders.value[orderIndex].remark = statusDialog.remark
        }
        
        // 更新修改时间
        orders.value[orderIndex].updatedAt = new Date().toISOString()
        
        // 保存到本地存储
        saveOrders(orders.value)
        
        // 显示成功消息
        ElMessage.success('订单状态已更新')
        
        // 发送WebSocket消息（仅演示）
        if (webSocketService.getConnectionStatus()) {
          webSocketService.sendMessage({
            type: 'status_change',
            orderNumber: orders.value[orderIndex].orderNumber,
            oldStatus: statusDialog.currentStatus,
            newStatus: statusDialog.newStatus,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    // 关闭对话框
    statusDialog.visible = false
    
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error('更新订单状态失败')
  } finally {
    statusDialog.loading = false
  }
}

// 查看订单详情
const viewOrderDetails = (row: any) => {
  detailDialog.order = row
  detailDialog.visible = true
}

// 导出数据
const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

// 获取客户名称方法
const getCustomerName = (customerId: string) => {
  const customer = customerOptions.value.find(c => c.id === customerId)
  return customer ? customer.name : `客户${customerId}`
}

// 查看客户详情
const viewCustomer = (customerId: string) => {
  router.push({
    path: '/admin/customers',
    query: { customerId }
  })
}

// 加载客户选项数据
const loadCustomerOptions = () => {
  // 从localStorage加载真实用户数据
  try {
    // 从users集合中获取非管理员用户
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      const allUsers = JSON.parse(storedUsers)
      // 过滤掉管理员用户，只保留普通客户
      const customers = allUsers.filter((user: any) => user.role !== 'admin')
      
      customerOptions.value = customers.map((user: any) => ({
        id: String(user.id),
        name: user.username
      }))
      
      console.log('加载了', customerOptions.value.length, '个客户')
    } else {
      // 如果没有用户数据，初始化为空数组
      customerOptions.value = []
      console.log('没有找到用户数据')
    }
  } catch (error) {
    console.error('加载客户数据失败:', error)
    customerOptions.value = []
  }
}

// 处理新订单添加
const addTestOrder = () => {
  // 检查是否有客户
  if (customerOptions.value.length === 0) {
    ElMessage.warning('没有客户数据，请先添加客户')
    return
  }
  
  // 获取现有订单号中的最大id
  const maxId = orders.value.reduce((max, order) => Math.max(max, order.id || 0), 0)
  
  // 创建新订单对象
  const now = new Date()
  const typePrefix = activeOrderTab.value === 'recharge' ? 'R' : 'W'
  const statusPrefix = activeOrderTab.value === 'recharge' ? 'recharge' : 'withdraw'
  
  // 随机选择一个客户
  const randomIndex = Math.floor(Math.random() * customerOptions.value.length)
  const randomCustomerId = customerOptions.value[randomIndex].id
  
  const newOrder = {
    id: maxId + 1,
    orderNumber: `${typePrefix}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    type: activeOrderTab.value,
    amount: (Math.random() * 5000 + 500).toFixed(2),
    status: `${statusPrefix}_pending`,
    createdAt: now.toISOString(),
    updatedAt: null,
    paymentMethod: activeOrderTab.value === 'recharge' ? ['alipay', 'wechat', 'bank'][Math.floor(Math.random() * 3)] : null,
    remark: '',
    customerId: randomCustomerId
  }
  
  // 将新订单添加到数组
  orders.value.unshift(newOrder)
  
  // 保存到本地存储
  saveOrders(orders.value)
  
  ElMessage.success('测试订单已添加')
}

// 获取支付方式标签
const getPaymentMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'bank': '银行转账',
    'other': '其他方式'
  }
  return methodMap[method] || method
}

// 模拟读取订单数据
const fetchOrderData = () => {
  loading.value = true
  
  try {
    // 从localStorage获取订单数据，如果没有则使用初始模拟数据
    const storedOrders = localStorage.getItem('realOrders')
    let allOrders: any[] = storedOrders ? JSON.parse(storedOrders) : []
    
    if (!Array.isArray(allOrders) || allOrders.length === 0) {
      // 如果没有订单数据，生成模拟数据
      allOrders = generateMockOrders()
      localStorage.setItem('realOrders', JSON.stringify(allOrders))
    }
    
    // 确保订单有客户ID
    allOrders = allOrders.map((order: any) => {
      if (!order.customerId && customerOptions.value.length > 0) {
        // 随机分配一个客户ID
        const randomIndex = Math.floor(Math.random() * customerOptions.value.length)
        const randomCustomerId = customerOptions.value[randomIndex].id
        return { ...order, customerId: randomCustomerId }
      }
      return order
    })
    
    // 保存更新后的订单数据
    localStorage.setItem('realOrders', JSON.stringify(allOrders))
    
    return allOrders
  } catch (error) {
    console.error('获取订单数据失败:', error)
    return []
  } finally {
    loading.value = false
  }
}

// 生成模拟订单
const generateMockOrders = () => {
  const mockOrders = []
  const orderTypes = ['recharge', 'withdraw']
  const rechargeStatuses = ['recharge_pending', 'recharge_processing', 'recharge_completed', 'recharge_failed']
  const withdrawStatuses = ['withdraw_pending', 'withdraw_processing', 'withdraw_completed', 'withdraw_failed']
  
  // 创建50条模拟订单
  for (let i = 0; i < 50; i++) {
    const typeIndex = Math.floor(Math.random() * orderTypes.length)
    const type = orderTypes[typeIndex]
    
    const now = new Date()
    const randomDays = Math.floor(Math.random() * 30)
    const orderDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
    
    const statuses = type === 'recharge' ? rechargeStatuses : withdrawStatuses
    const statusIndex = Math.floor(Math.random() * statuses.length)
    
    // 随机分配一个客户ID
    const customerId = String(Math.floor(Math.random() * 20) + 1)
    
    mockOrders.push({
      id: i + 1,
      orderNumber: `${type === 'recharge' ? 'R' : 'W'}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
      type,
      amount: (Math.random() * 5000 + 500).toFixed(2),
      status: statuses[statusIndex],
      createdAt: orderDate.toISOString(),
      updatedAt: type === 'recharge' && statuses[statusIndex] === 'recharge_completed' ? 
        new Date(orderDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
      paymentMethod: type === 'recharge' ? ['alipay', 'wechat', 'bank'][Math.floor(Math.random() * 3)] : null,
      bankInfo: type === 'withdraw' ? {
        bankName: ['工商银行', '建设银行', '农业银行', '招商银行'][Math.floor(Math.random() * 4)],
        accountName: `用户${Math.floor(Math.random() * 100)}`,
        accountNumber: `6222************${Math.floor(Math.random() * 1000)}`
      } : null,
      remark: Math.random() > 0.7 ? '客户备注信息' : '',
      customerId
    })
  }
  
  return mockOrders
}

// 清除客户筛选
const clearCustomerFilter = () => {
  filters.customerId = ''
  handleSearch()
  
  // 更新URL，移除客户参数
  router.replace({
    query: { ...route.query, customerId: undefined, customerName: undefined }
  })
}

// 保存订单到本地存储
const saveOrders = (ordersData: any[]) => {
  try {
    localStorage.setItem('realOrders', JSON.stringify(ordersData))
  } catch (error) {
    console.error('保存订单数据失败:', error)
  }
}

// 详情对话框使用的模板数据
const orderDetails = (row: any) => {
  return {
    orderNumber: row.orderNumber || '未知',
    type: row.type === 'recharge' ? '充值订单' : '提现订单',
    amount: row.amount ? `${row.amount} 元` : '未知',
    status: getStatusLabel(row.status),
    statusClass: getStatusType(row.status),
    createdAt: row.createdAt || '未知',
    updatedAt: row.updatedAt || '尚未更新',
    customerName: getCustomerName(row.customerId) || '未知',
    paymentMethod: row.paymentMethod ? getPaymentMethodLabel(row.paymentMethod) : '未知',
    bankInfo: row.bankInfo || null,
    remark: row.remark || '无',
    qrCode: row.qrCode || null,
    idProof: row.idProof || null
  }
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

.order-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
}

.proof-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.proof-image-container {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.proof-image {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.customer-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
</style> 