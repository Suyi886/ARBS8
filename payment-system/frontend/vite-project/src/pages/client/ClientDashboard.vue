<template>
  <div class="client-dashboard">
    <div class="welcome-section">
      <div class="welcome-header">
        <h2>
          <span>您好，{{ userInfo?.username }}</span>
          <span class="welcome-greeting">{{ getGreeting() }}</span>
        </h2>
        <div class="last-login">
          <el-icon><Timer /></el-icon>
          <span>上次登录: {{ lastLoginTime || '首次登录' }}</span>
        </div>
      </div>
    </div>
    
    <div class="dashboard-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card account-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>账户余额</span>
                <el-button link>明细</el-button>
              </div>
            </template>
            <div class="card-content">
              <span class="balance">￥{{ accountStats.balance.toFixed(2) }}</span>
              <div class="card-actions">
                <el-button type="primary" size="small" @click="goToRecharge">充值</el-button>
                <el-button size="small" @click="goToWithdraw">提现</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card order-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>订单总览</span>
                <el-button link @click="goToOrders">查看全部</el-button>
              </div>
            </template>
            <div class="card-content">
              <div class="order-stats">
                <div class="stat-item">
                  <div class="stat-label">今日充值订单</div>
                  <div class="stat-value">{{ accountStats.todayRechargeCount }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">今日提现订单</div>
                  <div class="stat-value">{{ accountStats.todayWithdrawCount }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">待处理</div>
                  <div class="stat-value">{{ accountStats.pendingRechargeCount + accountStats.pendingWithdrawCount }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card message-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>消息通知</span>
                <el-button link @click="goToMessages">全部消息</el-button>
              </div>
            </template>
            <div class="card-content">
              <div class="message-stats">
                <div class="stat-item">
                  <div class="stat-label">未读消息</div>
                  <div class="stat-value">
                    <span>{{ accountStats.unreadMessageCount }}</span>
                    <el-badge value="new" type="danger" class="new-badge" />
                  </div>
                </div>
              </div>
              <div class="latest-message">
                <div class="message-title">系统通知：您的提现已完成</div>
                <div class="message-time">10分钟前</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card help-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>帮助中心</span>
              </div>
            </template>
            <div class="card-content">
              <div class="help-links">
                <div class="help-link" @click="openHelpDialog('faq')">
                  <el-icon><QuestionFilled /></el-icon>
                  <span>常见问题</span>
                </div>
                <div class="help-link" @click="openHelpDialog('contact')">
                  <el-icon><Service /></el-icon>
                  <span>联系客服</span>
                </div>
                <div class="help-link" @click="openHelpDialog('tutorials')">
                  <el-icon><Document /></el-icon>
                  <span>使用教程</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-sections">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <el-card class="section-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
                <el-button link @click="goToOrders">查看更多</el-button>
              </div>
            </template>
            <div class="recent-orders">
              <el-table :data="recentOrders" stripe style="width: 100%">
                <el-table-column prop="orderNumber" label="订单号" width="180" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.type === 'recharge' ? 'success' : 'info'">
                      {{ row.type === 'recharge' ? '充值' : '提现' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="120">
                  <template #default="{ row }">
                    <span>{{ row.amount }} 元</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="时间" width="150" />
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="viewOrderDetails(row)">
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="8">
          <el-card class="section-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>系统公告</span>
              </div>
            </template>
            <div class="announcements">
              <div v-for="(item, index) in announcements" :key="index" class="announcement-item">
                <div class="announcement-title">{{ item.title }}</div>
                <div class="announcement-time">{{ item.time }}</div>
                <div class="announcement-content">{{ item.content }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
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
        <el-descriptions-item label="更新时间">{{ detailDialog.order?.updatedAt || detailDialog.order?.createdAt }}</el-descriptions-item>
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

    <!-- 帮助中心对话框 -->
    <el-dialog
      v-model="helpDialog.visible"
      :title="helpDialog.title"
      width="600px"
      destroy-on-close
    >
      <!-- 联系客服内容 -->
      <div v-if="helpDialog.type === 'contact'" class="help-dialog-content">
        <div v-if="contactInfo.hotline || contactInfo.email || contactInfo.online" class="contact-info">
          <div v-if="contactInfo.hotline" class="contact-item">
            <strong>客服热线：</strong>
            <span>{{ contactInfo.hotline }}</span>
          </div>
          <div v-if="contactInfo.email" class="contact-item">
            <strong>电子邮箱：</strong>
            <span>{{ contactInfo.email }}</span>
          </div>
          <div v-if="contactInfo.online" class="contact-item">
            <strong>在线客服：</strong>
            <span>{{ contactInfo.online }}</span>
          </div>
          <div v-if="contactInfo.workingHours" class="contact-item">
            <strong>工作时间：</strong>
            <span>{{ contactInfo.workingHours }}</span>
          </div>
          <div v-if="contactInfo.description" class="contact-item desc">
            <strong>客服说明：</strong>
            <p>{{ contactInfo.description }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无客服信息" />
      </div>

      <!-- 常见问题内容 -->
      <div v-if="helpDialog.type === 'faq'" class="help-dialog-content">
        <el-collapse v-if="faqItems.length > 0">
          <el-collapse-item
            v-for="(item, index) in faqItems"
            :key="index"
            :title="item.question"
          >
            <div v-html="item.answer.replace(/\n/g, '<br>')"></div>
          </el-collapse-item>
        </el-collapse>
        <el-empty v-else description="暂无常见问题" />
      </div>

      <!-- 使用教程内容 -->
      <div v-if="helpDialog.type === 'tutorials'" class="help-dialog-content">
        <el-collapse v-if="tutorialItems.length > 0">
          <el-collapse-item
            v-for="(item, index) in tutorialItems"
            :key="index"
            :title="item.title"
          >
            <div v-html="item.content.replace(/\n/g, '<br>')"></div>
          </el-collapse-item>
        </el-collapse>
        <el-empty v-else description="暂无使用教程" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Timer, 
  QuestionFilled, 
  Service, 
  Document 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 最后登录时间
const lastLoginTime = ref('2024-02-25 08:30:45')

// 订单详情对话框
const detailDialog = reactive({
  visible: false,
  order: null as any
})

// 账户信息和统计数据
const accountStats = reactive({
  balance: 8765.50,
  todayRechargeCount: 0,
  todayWithdrawCount: 0,
  todayRechargeAmount: 0,
  todayWithdrawAmount: 0,
  pendingRechargeCount: 0,
  pendingWithdrawCount: 0,
  unreadMessageCount: 3,
  date: new Date().toISOString().split('T')[0]
})

// 最近订单数据
const recentOrders = ref([
  {
    orderNumber: 'R202402250001',
    type: 'recharge',
    amount: '1000.00',
    createdAt: '2024-02-25 09:15',
    status: 'recharge_completed',
    remark: ''
  },
  {
    orderNumber: 'W202402240003',
    type: 'withdraw',
    amount: '500.00',
    createdAt: '2024-02-24 16:30',
    status: 'withdraw_processing',
    remark: ''
  },
  {
    orderNumber: 'R202402230002',
    type: 'recharge',
    amount: '2000.00',
    createdAt: '2024-02-23 14:20',
    status: 'recharge_completed',
    remark: ''
  },
  {
    orderNumber: 'W202402220001',
    type: 'withdraw',
    amount: '1500.00',
    createdAt: '2024-02-22 10:45',
    status: 'withdraw_completed',
    remark: ''
  }
])

// 系统公告
const announcements = ref([
  {
    title: '系统维护通知',
    time: '2024-02-25',
    content: '尊敬的用户，我们将于2024年2月28日凌晨2:00-4:00进行系统维护，届时系统将暂停服务。给您带来的不便，敬请谅解。'
  },
  {
    title: '充值优惠活动',
    time: '2024-02-20',
    content: '即日起至2024年3月1日，单笔充值满1000元即可获得50元优惠券，详情请咨询客服。'
  }
])

// 帮助中心相关
const helpDialog = reactive({
  visible: false,
  type: '',
  title: ''
});

// 联系客服信息
const contactInfo = reactive({
  hotline: '',
  email: '',
  online: '',
  workingHours: '',
  description: ''
});

// 常见问题
const faqItems = ref<Array<{question: string, answer: string, category: string}>>([]);

// 使用教程
const tutorialItems = ref<Array<{title: string, content: string, category: string}>>([]);

// 生命周期钩子
onMounted(() => {
  // 初始化：加载账户信息和统计数据
  loadAccountStats()
  
  // 加载最近订单
  loadRecentOrders()
  
  // 加载帮助中心数据
  loadHelpCenterData()
})

// 加载账户统计数据
const loadAccountStats = () => {
  try {
    // 尝试从本地存储加载账户统计
    const storedStats = localStorage.getItem('client_account_stats')
    if (storedStats) {
      const parsedStats = JSON.parse(storedStats)
      
      // 检查统计数据是否是今天的
      if (isToday(parsedStats.date)) {
        // 如果是今天的数据，直接使用
        Object.assign(accountStats, parsedStats)
        console.log('从本地存储加载今日账户统计数据')
      } else {
        // 如果不是今天的数据，重置每日统计，保留余额
        resetDailyStats()
        console.log('重置今日账户统计数据')
      }
    } else {
      // 如果没有存储的统计数据，使用初始值
      resetDailyStats()
    }
    
    // 更新统计数据
    updateAccountStats()
  } catch (error) {
    console.error('加载账户统计数据失败:', error)
    // 如果出错，使用初始值
    resetDailyStats()
  }
}

// 检查日期是否是今天
const isToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

// 重置每日统计数据
const resetDailyStats = () => {
  // 保留余额，重置其他每日统计
  const balance = accountStats.balance
  Object.assign(accountStats, {
    balance,
    todayRechargeCount: 0,
    todayWithdrawCount: 0,
    todayRechargeAmount: 0,
    todayWithdrawAmount: 0,
    pendingRechargeCount: 0,
    pendingWithdrawCount: 0,
    unreadMessageCount: 0,
    date: new Date().toISOString().split('T')[0]
  })
}

// 更新账户统计数据
const updateAccountStats = () => {
  // 从本地订单数据计算统计数据
  updateStatsFromLocalData()
  
  // 保存到本地存储
  saveAccountStats()
}

// 从本地订单数据更新统计
const updateStatsFromLocalData = () => {
  try {
    // 获取本地存储的订单数据
    const storedOrders = localStorage.getItem('realOrders')
    if (!storedOrders) return
    
    const orders = JSON.parse(storedOrders)
    if (!Array.isArray(orders)) return
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0]
    
    // 过滤今日订单
    const todayOrders = orders.filter(order => order.createdAt?.includes(today))
    
    // 计算今日充值订单统计
    const todayRechargeOrders = todayOrders.filter(order => order.type === 'recharge')
    accountStats.todayRechargeCount = todayRechargeOrders.length
    accountStats.todayRechargeAmount = todayRechargeOrders.reduce((sum, order) => 
      sum + parseFloat(order.amount || 0), 0)
    
    // 计算今日提现订单统计
    const todayWithdrawOrders = todayOrders.filter(order => order.type === 'withdraw')
    accountStats.todayWithdrawCount = todayWithdrawOrders.length
    accountStats.todayWithdrawAmount = todayWithdrawOrders.reduce((sum, order) => 
      sum + parseFloat(order.amount || 0), 0)
    
    // 计算待处理订单数
    const pendingRechargeOrders = orders.filter(order => 
      order.type === 'recharge' && order.status.includes('pending'))
    accountStats.pendingRechargeCount = pendingRechargeOrders.length
    
    const pendingWithdrawOrders = orders.filter(order => 
      order.type === 'withdraw' && order.status.includes('pending'))
    accountStats.pendingWithdrawCount = pendingWithdrawOrders.length
    
    // 更新日期为今天
    accountStats.date = today
    
    console.log('已更新账户统计数据')
  } catch (error) {
    console.error('更新账户统计数据失败:', error)
    // 保留当前值
  }
}

// 保存账户统计数据到本地存储
const saveAccountStats = () => {
  try {
    localStorage.setItem('client_account_stats', JSON.stringify(accountStats))
  } catch (error) {
    console.error('保存账户统计数据失败:', error)
  }
}

// 加载最近订单
const loadRecentOrders = () => {
  try {
    // 获取本地存储的订单数据
    const storedOrders = localStorage.getItem('realOrders')
    if (!storedOrders) return
    
    const orders = JSON.parse(storedOrders)
    if (!Array.isArray(orders)) return
    
    // 按创建时间降序排序
    orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // 取前5条
    recentOrders.value = orders.slice(0, 5).map(order => ({
      orderNumber: order.orderNumber,
      type: order.type,
      amount: order.amount,
      createdAt: formatDateTime(new Date(order.createdAt)),
      status: order.status,
      remark: order.remark || ''
    }))
  } catch (error) {
    console.error('加载最近订单失败:', error)
    // 保留默认订单数据
  }
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好！'
  if (hour < 9) return '早上好！'
  if (hour < 12) return '上午好！'
  if (hour < 14) return '中午好！'
  if (hour < 17) return '下午好！'
  if (hour < 19) return '傍晚好！'
  if (hour < 22) return '晚上好！'
  return '夜深了！'
}

// 根据状态获取显示标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'recharge_pending': '待处理',
    'recharge_processing': '处理中',
    'recharge_completed': '已完成',
    'recharge_failed': '失败',
    'withdraw_pending': '待处理',
    'withdraw_processing': '处理中',
    'withdraw_completed': '已完成',
    'withdraw_failed': '失败',
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

// 查看订单详情
const viewOrderDetails = (row: any) => {
  detailDialog.order = { ...row }
  detailDialog.visible = true
}

// 导航方法
const goToOrders = () => {
  router.push('/client/orders')
}

const goToRecharge = () => {
  router.push('/client/recharge')
}

const goToWithdraw = () => {
  router.push('/client/withdraw')
}

const goToMessages = () => {
  router.push('/client/messages')
}

// 加载帮助中心数据
const loadHelpCenterData = () => {
  try {
    // 加载联系客服信息
    const savedContactInfo = localStorage.getItem('helpCenter_contact');
    if (savedContactInfo) {
      const parsed = JSON.parse(savedContactInfo);
      Object.assign(contactInfo, parsed);
    }
    
    // 加载常见问题
    const savedFaqItems = localStorage.getItem('helpCenter_faq');
    if (savedFaqItems) {
      faqItems.value = JSON.parse(savedFaqItems);
    }
    
    // 加载使用教程
    const savedTutorialItems = localStorage.getItem('helpCenter_tutorials');
    if (savedTutorialItems) {
      tutorialItems.value = JSON.parse(savedTutorialItems);
    }
  } catch (error) {
    console.error('加载帮助中心数据失败:', error);
  }
};

// 打开帮助对话框
const openHelpDialog = (type: string) => {
  helpDialog.type = type;
  
  if (type === 'contact') {
    helpDialog.title = '联系客服';
  } else if (type === 'faq') {
    helpDialog.title = '常见问题';
  } else if (type === 'tutorials') {
    helpDialog.title = '使用教程';
  }
  
  helpDialog.visible = true;
};
</script>

<style scoped>
.client-dashboard {
  padding: 20px 0;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.welcome-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome-greeting {
  font-size: 16px;
  color: #67c23a;
  font-weight: normal;
}

.last-login {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dashboard-cards {
  margin-bottom: 24px;
}

.dashboard-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  border-radius: 8px;
}

.dashboard-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-card {
  border-left: 4px solid #409eff;
}

.order-card {
  border-left: 4px solid #67c23a;
}

.message-card {
  border-left: 4px solid #e6a23c;
}

.help-card {
  border-left: 4px solid #909399;
}

.card-content {
  padding: 10px 0;
}

.balance {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  display: block;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.order-stats, .message-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.latest-message {
  border-top: 1px dashed #ebeef5;
  padding-top: 10px;
}

.message-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.help-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.help-link:hover {
  color: #409eff;
}

.dashboard-sections {
  margin-bottom: 24px;
}

.section-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
}

.recent-orders {
  overflow-x: auto;
}

.announcements {
  max-height: 400px;
  overflow-y: auto;
}

.announcement-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.announcement-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.announcement-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.new-badge {
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .welcome-header h2 {
    font-size: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .welcome-greeting {
    font-size: 14px;
  }
  
  .balance {
    font-size: 24px;
  }
  
  .dashboard-card {
    margin-bottom: 16px;
  }
}

/* 帮助中心对话框样式 */
.help-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.contact-info {
  padding: 10px;
}

.contact-item {
  margin-bottom: 12px;
}

.contact-item strong {
  color: #606266;
}

.contact-item.desc p {
  margin: 8px 0 0 0;
  white-space: pre-line;
}
</style> 