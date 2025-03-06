<template>
  <div class="order-status">
    <div class="page-header">
      <h2>我的订单</h2>
      <div class="header-actions">
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <div class="order-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="充值订单" name="recharge">
          <div class="filter-section">
            <el-form :inline="true" class="filter-form">
              <el-form-item label="订单状态">
                <el-select v-model="filters.rechargeStatus" placeholder="选择状态">
                  <el-option label="全部" value="" />
                  <el-option v-for="status in rechargeStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
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
          
          <div class="order-table-container">
            <el-table
              v-loading="loading"
              :data="rechargeOrders"
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
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusLabel(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="200" />
              <el-table-column fixed="right" label="操作" width="120">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="info" 
                    @click="viewOrderDetails(scope.row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, prev, pager, next, jumper"
                :total="totalRechargeOrders"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="提现订单" name="withdraw">
          <div class="filter-section">
            <el-form :inline="true" class="filter-form">
              <el-form-item label="订单状态">
                <el-select v-model="filters.withdrawStatus" placeholder="选择状态">
                  <el-option label="全部" value="" />
                  <el-option v-for="status in withdrawStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
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
          
          <div class="order-table-container">
            <el-table
              v-loading="loading"
              :data="withdrawOrders"
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
                      type="info" 
                      @click="viewOrderDetails(scope.row)"
                    >
                      查看详情
                    </el-button>
                    <el-button
                      v-if="scope.row.status === 'withdraw_completed'"
                      size="small"
                      type="warning"
                      @click="reportIssue(scope.row)"
                    >
                      报告问题
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, prev, pager, next, jumper"
                :total="totalWithdrawOrders"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
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
        <el-descriptions-item label="创建时间">{{ detailDialog.order?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailDialog.order?.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailDialog.order?.status)">
            {{ getStatusLabel(detailDialog.order?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailDialog.order?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 报告问题对话框 -->
    <el-dialog
      v-model="issueDialog.visible"
      title="报告订单问题"
      width="500px"
    >
      <div class="issue-form">
        <el-form label-width="100px">
          <el-form-item label="订单号">
            <span>{{ issueDialog.order?.orderNumber }}</span>
          </el-form-item>
          
          <el-form-item label="问题类型">
            <el-select v-model="issueDialog.issueType" placeholder="选择问题类型">
              <el-option label="未收到款项" value="not_received" />
              <el-option label="金额不符" value="amount_mismatch" />
              <el-option label="其他问题" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="问题描述">
            <el-input
              v-model="issueDialog.description"
              type="textarea"
              rows="4"
              placeholder="请详细描述您遇到的问题"
            />
          </el-form-item>
          
          <el-form-item label="联系方式">
            <el-input
              v-model="issueDialog.contact"
              placeholder="请留下您的联系方式，方便我们联系您"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="issueDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitIssue" :loading="issueDialog.loading">
            提交问题
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Refresh,
  Search,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { webSocketService, type WebSocketEvent } from '@/utils/websocket'

const userStore = useUserStore()

// 模拟后端API调用
const mockFetchOrders = async (params: any) => {
  console.log('Fetching orders with params:', params)
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 从localStorage获取真实订单数据
  const storedOrders = localStorage.getItem('realOrders')
  let realOrders = storedOrders ? JSON.parse(storedOrders) : []
  
  // 确保是数组
  if (!Array.isArray(realOrders)) {
    realOrders = []
  }
  
  // 根据订单类型和其他条件筛选
  const filteredData = realOrders.filter((order: {
    type: string, 
    orderNumber: string, 
    status: string, 
    createdAt: string
  }) => {
    // 根据订单类型筛选
    if (params.orderType && order.type !== params.orderType) {
      return false
    }
    
    // 按订单号筛选
    if (params.orderNumber && !order.orderNumber.includes(params.orderNumber)) {
      return false
    }
    
    // 按状态筛选
    if (params.status && order.status !== params.status) {
      return false
    }
    
    // 按日期范围筛选
    if (params.dateRange && params.dateRange.length === 2) {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(params.dateRange[0])
      const endDate = new Date(params.dateRange[1])
      endDate.setDate(endDate.getDate() + 1) // 包含结束日期
      
      if (orderDate < startDate || orderDate >= endDate) {
        return false
      }
    }
    
    return true
  })
  
  // 如果没有找到订单，显示提示
  if (filteredData.length === 0) {
    console.log('没有找到符合条件的订单')
    // 检查是否有任何真实订单
    if (realOrders.length === 0) {
      ElMessage.info('您还没有提交过订单，请先提交充值或提现申请')
    } else if (params.orderType) {
      ElMessage.info(`没有找到符合条件的${params.orderType === 'recharge' ? '充值' : '提现'}订单`)
    }
  }
  
  // 排序：按创建时间降序
  filteredData.sort((a: { createdAt: string }, b: { createdAt: string }) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  // 模拟分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const paginatedData = filteredData.slice(start, end)
  
  return {
    orders: paginatedData,
    total: filteredData.length
  }
}

// 模拟提交订单问题
const mockSubmitIssue = async (data: any) => {
  console.log('Submitting issue:', data)
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟成功响应
  return { success: true }
}

// 状态和页面数据
const loading = ref(false)
const rechargeOrders = ref<any[]>([])
const withdrawOrders = ref<any[]>([])
const totalRechargeOrders = ref(0)
const totalWithdrawOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref('recharge')

// 过滤条件
const filters = reactive({
  rechargeStatus: '',
  withdrawStatus: '',
  orderNumber: '',
  dateRange: []
})

// 详情对话框
const detailDialog = reactive({
  visible: false,
  order: null as any
})

// 问题报告对话框
const issueDialog = reactive({
  visible: false,
  order: null as any,
  issueType: '',
  description: '',
  contact: '',
  loading: false
})

// WebSocket事件处理
const handleWebSocketEvent = (event: WebSocketEvent) => {
  // 处理订单状态变更事件
  if ('orderNumber' in event) {
    if ('oldStatus' in event) {
      // 如果是订单状态变更事件，自动刷新订单列表
      // 根据订单类型刷新对应的列表
      if (event.type === 'recharge' && activeTab.value === 'recharge') {
        refreshData()
      } else if (event.type === 'withdraw' && activeTab.value === 'withdraw') {
        refreshData()
      }
      
      // 如果订单详情对话框打开，且是正在查看的订单，也更新订单详情
      if (detailDialog.visible && detailDialog.order && detailDialog.order.orderNumber === event.orderNumber) {
        detailDialog.order.status = event.newStatus
        detailDialog.order.updatedAt = new Date().toISOString().split('T')[0]
        // 添加系统更新备注
        if (event.remark) {
          detailDialog.order.remark = event.remark
        }
      }
    } else {
      // 如果是新订单事件，也刷新列表
      if (event.type === 'recharge' && activeTab.value === 'recharge') {
        refreshData()
      } else if (event.type === 'withdraw' && activeTab.value === 'withdraw') {
        refreshData()
      }
    }
  }
}

// 充值订单状态选项
const rechargeStatusOptions = [
  { label: '充值待处理', value: 'recharge_pending' },
  { label: '充值处理中', value: 'recharge_processing' },
  { label: '充值已完成', value: 'recharge_completed' },
  { label: '充值失败', value: 'recharge_failed' }
]

// 提现订单状态选项
const withdrawStatusOptions = [
  { label: '提现待处理', value: 'withdraw_pending' },
  { label: '提现处理中', value: 'withdraw_processing' },
  { label: '提现已完成', value: 'withdraw_completed' },
  { label: '提现失败', value: 'withdraw_failed' }
]

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
  // 初始化：加载订单数据
  fetchOrders()
  
  // 确保至少有一些初始数据
  ensureInitialData()
  
  // 添加WebSocket事件监听
  webSocketService.addEventListener(handleWebSocketEvent)
})

onUnmounted(() => {
  // 移除WebSocket事件监听
  webSocketService.removeEventListener(handleWebSocketEvent)
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  currentPage.value = 1
  fetchOrders()
})

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true
  try {
    // 获取当前活动标签页的过滤状态
    const status = activeTab.value === 'recharge' ? filters.rechargeStatus : filters.withdrawStatus
    
    const { orders: data, total } = await mockFetchOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
      orderType: activeTab.value,
      status: status,
      orderNumber: filters.orderNumber,
      dateRange: filters.dateRange
    })
    
    // 根据当前标签页更新相应的订单数据
    if (activeTab.value === 'recharge') {
      rechargeOrders.value = data
      totalRechargeOrders.value = total
    } else {
      withdrawOrders.value = data
      totalWithdrawOrders.value = total
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    ElMessage.error('获取订单数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1 // 切换标签页时重置到第一页
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
  if (activeTab.value === 'recharge') {
    filters.rechargeStatus = ''
  } else {
    filters.withdrawStatus = ''
  }
  filters.orderNumber = ''
  filters.dateRange = []
  handleSearch()
}

// 分页处理
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}

// 查看订单详情
const viewOrderDetails = (row: any) => {
  detailDialog.order = { ...row }
  detailDialog.visible = true
}

// 报告问题
const reportIssue = (row: any) => {
  issueDialog.order = { ...row }
  issueDialog.issueType = ''
  issueDialog.description = ''
  issueDialog.contact = ''
  issueDialog.visible = true
}

// 提交问题
const submitIssue = async () => {
  // 表单验证
  if (!issueDialog.issueType) {
    ElMessage.warning('请选择问题类型')
    return
  }
  if (!issueDialog.description) {
    ElMessage.warning('请描述您遇到的问题')
    return
  }
  
  issueDialog.loading = true
  try {
    const result = await mockSubmitIssue({
      orderId: issueDialog.order.id,
      orderNumber: issueDialog.order.orderNumber,
      issueType: issueDialog.issueType,
      description: issueDialog.description,
      contact: issueDialog.contact,
      userId: userStore.userInfo?.id
    })
    
    if (result.success) {
      ElMessage.success('问题提交成功，我们会尽快处理')
      issueDialog.visible = false
      fetchOrders() // 刷新订单列表
    }
  } catch (error) {
    console.error('提交问题失败:', error)
    ElMessage.error('提交问题失败，请重试')
  } finally {
    issueDialog.loading = false
  }
}

// 确保至少有一些初始订单数据
const ensureInitialData = () => {
  // 检查localStorage中是否已经有订单数据
  const storedOrders = localStorage.getItem('realOrders')
  let realOrders = storedOrders ? JSON.parse(storedOrders) : []
  
  // 如果没有订单数据，创建一些初始测试订单
  if (!Array.isArray(realOrders) || realOrders.length === 0) {
    // 创建一个充值订单和一个提现订单作为示例
    realOrders = [
      {
        id: Date.now(),
        orderNumber: `R${new Date().getFullYear()}0001`,
        type: 'recharge',
        amount: '1000.00',
        customerName: '当前用户',
        customerAccount: 'customer@example.com',
        status: 'recharge_completed',
        remark: '初始充值订单示例',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: '系统'
      },
      {
        id: Date.now() + 1,
        orderNumber: `W${new Date().getFullYear()}0001`,
        type: 'withdraw',
        amount: '500.00',
        customerName: '当前用户',
        customerAccount: 'customer@example.com',
        status: 'withdraw_pending',
        remark: '初始提现订单示例',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: '系统'
      }
    ]
    
    // 保存到localStorage
    localStorage.setItem('realOrders', JSON.stringify(realOrders))
    
    console.log('已创建初始订单数据示例')
  }
}
</script>

<style scoped>
.order-status {
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

.order-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-table-container {
  margin-top: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tabs__nav-wrap)::after {
  height: 1px;
  background-color: #e4e7ed;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #1976d2;
}

:deep(.el-tabs__active-bar) {
  background-color: #1976d2;
}

.issue-form {
  padding: 10px;
}

@media (max-width: 768px) {
  .filter-form {
    display: flex;
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 10px;
  }
}
</style> 