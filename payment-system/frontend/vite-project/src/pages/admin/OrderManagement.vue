<template>
  <div class="order-management">
    <div class="page-header">
      <h2>订单管理</h2>
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
              v-for="status in getAvailableStatusOptions(statusDialog.currentStatus)"
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
            @click="confirmStatusChange" 
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
  Picture
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { webSocketService } from '@/utils/websocket'

// 模拟后端API调用
const mockFetchOrders = async (params: any) => {
  console.log('Fetching orders with params:', params)
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 获取本地存储的真实订单数据
  const storedOrders = localStorage.getItem('realOrders')
  let realOrders = storedOrders ? JSON.parse(storedOrders) : []
  
  // 如果没有真实订单数据，创建一个空数组
  if (!Array.isArray(realOrders)) {
    realOrders = []
  }
  
  // 根据订单类型过滤
  let filteredData = realOrders.filter((order: {
    type: string,
    orderNumber: string,
    status: string,
    createdAt: string
  }) => {
    const typeMatch = params.orderType ? order.type === params.orderType : true
    
    // 按订单号过滤
    const orderNumberMatch = params.orderNumber 
      ? order.orderNumber.includes(params.orderNumber)
      : true
      
    // 按状态过滤
    const statusMatch = params.status 
      ? order.status === params.status
      : true
      
    // 按日期范围过滤
    let dateMatch = true
    if (params.dateRange && params.dateRange.length === 2) {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(params.dateRange[0])
      const endDate = new Date(params.dateRange[1])
      endDate.setDate(endDate.getDate() + 1) // 包含结束日期
      
      dateMatch = orderDate >= startDate && orderDate < endDate
    }
    
    return typeMatch && orderNumberMatch && statusMatch && dateMatch
  })
  
  // 如果没有真实订单数据，显示提示
  if (filteredData.length === 0) {
    ElMessage.info('没有找到符合条件的订单数据，请尝试提交新订单或检查筛选条件')
  }
  
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
      orderType: type,
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
const activeOrderTab = ref('recharge') // 当前选中的订单类型选项卡

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
  return orders.value.filter(order => 
    order.type === activeOrderTab.value &&
    (filters.status ? order.status === filters.status : true)
  )
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
  filters.orderType = tab
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

// 生命周期钩子
onMounted(() => {
  fetchOrders()
  
  // 添加WebSocket事件监听
  webSocketService.addEventListener(handleWebSocketEvent)
  
  // 测试：创建一个默认的提现测试订单
  if (!localStorage.getItem('realOrders')) {
    createTestWithdrawOrder()
  }
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
      orderType: activeOrderTab.value,
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
  statusDialog.newStatus = '' // 重置选择
  statusDialog.remark = ''
  statusDialog.visible = true
}

// 确认修改状态
const confirmStatusChange = async () => {
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
      ElMessage.success('状态修改成功')
      statusDialog.visible = false
      
      // 更新本地数据
      const index = orders.value.findIndex(o => o.id === statusDialog.orderId)
      if (index !== -1) {
        orders.value[index].status = statusDialog.newStatus
        orders.value[index].remark = statusDialog.remark || orders.value[index].remark
      }
    }
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('修改状态失败，请重试')
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

// 创建测试提现订单
const createTestWithdrawOrder = () => {
  // 准备模拟数据
  const orderNumber = `W${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
  
  const testOrder = {
    id: 1,
    orderNumber,
    type: 'withdraw',
    amount: '500.00',
    customerName: '测试客户',
    customerAccount: 'test@example.com',
    status: 'withdraw_pending',
    remark: '测试提现订单',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: '客户'
  }
  
  // 保存到本地存储
  localStorage.setItem('realOrders', JSON.stringify([testOrder]))
  
  // 显示通知
  ElMessage.success(`已创建测试提现订单: ${orderNumber}`)
  
  return testOrder
}

// 添加测试按钮
const addTestOrder = () => {
  if (activeOrderTab.value === 'recharge') {
    // 创建充值测试订单
    const orderNumber = `R${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
    
    const testOrder = {
      orderNumber,
      type: 'recharge',
      amount: (Math.random() * 1000 + 100).toFixed(2),
      customerName: '测试客户',
      customerAccount: 'test@example.com',
      status: 'recharge_pending',
      timestamp: new Date().toISOString().split('T')[0]
    }
    
    addRealOrder(testOrder)
  } else {
    // 创建提现测试订单
    const orderNumber = `W${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
    
    const testOrder = {
      orderNumber,
      type: 'withdraw',
      amount: (Math.random() * 1000 + 100).toFixed(2),
      customerName: '测试客户',
      customerAccount: 'test@example.com',
      status: 'withdraw_pending',
      timestamp: new Date().toISOString().split('T')[0]
    }
    
    addRealOrder(testOrder)
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
</style> 