<template>
  <div class="customer-management">
    <div class="page-header">
      <h2>{{ $t('customer.management') }}</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('customer.search')"
          class="search-input"
          prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        />
        <language-switcher class="language-switcher-container" />
        <el-button type="primary" @click="handleCreateCustomer">
          <el-icon><Plus /></el-icon>
          {{ $t('customer.add') }}
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon total">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('customer.total') }}</div>
              <div class="stat-value">{{ stats.totalCustomers }}</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon active">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('customer.active') }}</div>
              <div class="stat-value">{{ stats.activeCustomers }}</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon new">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ $t('customer.newAdded') }}</div>
              <div class="stat-value">{{ stats.newCustomers }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 客户列表 -->
    <el-card class="customer-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title">{{ $t('customer.list') }}</div>
          <div class="header-filters">
            <el-select v-model="statusFilter" :placeholder="$t('customer.status.all')" class="filter-select">
              <el-option :label="$t('customer.status.all')" value="" />
              <el-option :label="$t('customer.status.active')" value="active" />
              <el-option :label="$t('customer.status.inactive')" value="inactive" />
            </el-select>
          </div>
        </div>
      </template>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="filteredCustomers"
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column type="expand">
            <template #default="props">
              <div class="expanded-row">
                <el-descriptions border :column="2">
                  <el-descriptions-item label="创建时间">{{ formatDate(props.row.createdAt) }}</el-descriptions-item>
                  <el-descriptions-item label="最后登录">{{ formatDate(props.row.lastLoginAt) }}</el-descriptions-item>
                  <el-descriptions-item label="当前余额">{{ formatCurrency(props.row.balance) }}</el-descriptions-item>
                  <el-descriptions-item label="总充值金额">{{ formatCurrency(props.row.totalRecharge) }}</el-descriptions-item>
                  <el-descriptions-item label="总提现金额">{{ formatCurrency(props.row.totalWithdraw) }}</el-descriptions-item>
                  <el-descriptions-item label="收益">{{ formatCurrency(Math.max(0, props.row.totalRecharge - props.row.totalWithdraw)) }}</el-descriptions-item>
                </el-descriptions>
                
                <div class="action-buttons">
                  <el-button type="primary" @click.stop="viewCustomerOrders(props.row)">查看订单</el-button>
                  <el-button @click.stop="editCustomer(props.row)">编辑信息</el-button>
                  <el-button type="danger" @click.stop="resetPassword(props.row)">重置密码</el-button>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="balance" label="账户余额" width="120">
            <template #default="scope">
              {{ formatCurrency(scope.row.balance) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'active' ? 'success' : 'info'"
                effect="plain"
              >
                {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最近登录" width="150">
            <template #default="scope">
              <div class="last-activity">
                <span class="time">{{ formatDate(scope.row.lastLoginAt) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                @click.stop="viewCustomerOrders(scope.row)"
              >
                订单
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click.stop="viewCustomerDetails(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredCustomers.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑客户对话框 -->
    <el-dialog
      v-model="customerDialog.visible"
      :title="customerDialog.isEdit ? '编辑客户' : '添加客户'"
      width="600px"
    >
      <el-form
        ref="customerFormRef"
        :model="customerDialog.form"
        :rules="customerDialog.rules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="customerDialog.form.username" :disabled="customerDialog.isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="customerDialog.form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="customerDialog.form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="customerDialog.form.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="customerDialog.form.status" style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!customerDialog.isEdit" label="密码" prop="password">
          <el-input v-model="customerDialog.form.password" type="password" show-password />
        </el-form-item>
        <el-form-item v-if="!customerDialog.isEdit" label="确认密码" prop="confirmPassword">
          <el-input v-model="customerDialog.form.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="customerDialog.form.remark"
            type="textarea"
            :rows="3"
            placeholder="客户备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="customerDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitCustomerForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="客户详情"
      width="800px"
    >
      <el-tabs v-model="detailDialog.activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions border :column="2" direction="vertical">
            <el-descriptions-item label="ID">{{ detailDialog.customer?.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ detailDialog.customer?.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ detailDialog.customer?.name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="detailDialog.customer?.status === 'active' ? 'success' : 'info'"
              >
                {{ detailDialog.customer?.status === 'active' ? '活跃' : '非活跃' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detailDialog.customer?.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ detailDialog.customer?.email || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(detailDialog.customer?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ formatDate(detailDialog.customer?.lastLoginAt) }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detailDialog.customer?.remark || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <el-tab-pane label="账户信息" name="account">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="账户余额" :value="detailDialog.customer?.balance" :precision="2">
                <template #prefix>
                  <el-icon><Money /></el-icon>
                </template>
                <template #suffix>元</template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="总充值金额" :value="detailDialog.customer?.totalRecharge" :precision="2">
                <template #suffix>元</template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="总提现金额" :value="detailDialog.customer?.totalWithdraw" :precision="2">
                <template #suffix>元</template>
              </el-statistic>
            </el-col>
          </el-row>
          
          <el-divider />
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="充值次数" :value="detailDialog.customer?.rechargeCount || 0"></el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="提现次数" :value="detailDialog.customer?.withdrawCount || 0"></el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic 
                title="净收益" 
                :value="Math.max(0, (detailDialog.customer?.totalRecharge || 0) - (detailDialog.customer?.totalWithdraw || 0))" 
                :precision="2"
                :value-style="{ color: '#67C23A' }"
              >
                <template #suffix>元</template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <el-tab-pane label="最近订单" name="orders">
          <el-table
            :data="detailDialog.recentOrders"
            style="width: 100%"
            max-height="400"
          >
            <el-table-column prop="orderNumber" label="订单号" width="180" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'recharge' ? 'success' : 'warning'">
                  {{ scope.row.type === 'recharge' ? '充值' : '提现' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="scope">
                {{ formatCurrency(scope.row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)">
                  {{ getOrderStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="view-all-link">
            <el-button link type="primary" @click="detailDialog.customer && viewCustomerOrders(detailDialog.customer)">查看全部订单</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
          <el-button type="primary" @click="detailDialog.customer && editCustomer(detailDialog.customer)">编辑</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetDialog.visible"
      title="重置密码确认"
      width="500px"
    >
      <el-alert
        title="重置密码将生成一个新的随机密码，并发送给客户"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />
      
      <el-form
        ref="resetFormRef"
        :model="resetDialog.form"
        :rules="resetDialog.rules"
        label-width="120px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetDialog.form.newPassword"
            type="password"
            show-password
            placeholder="留空将自动生成随机密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetDialog.form.confirmPassword"
            type="password"
            show-password
            placeholder="留空将自动生成随机密码"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetDialog.visible = false">取消</el-button>
          <el-button type="danger" @click="confirmResetPassword">确认重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, Check, Star, Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import apiService from '@/utils/api'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

// 定义客户类型接口
interface Customer {
  id: number | string;
  username: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  balance: number;
  totalRecharge: number;
  totalWithdraw: number;
  rechargeCount: number;
  withdrawCount: number;
  createdAt: string;
  lastLoginAt: string | null;
  remark?: string;
}

// 定义订单类型接口
interface Order {
  id: string | number;
  customerId: string | number;
  orderNumber: string;
  type: 'recharge' | 'withdraw';
  amount: number;
  status: string;
  createdAt: string;
  [key: string]: any;
}

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 客户统计数据
const stats = reactive({
  totalCustomers: 0,
  activeCustomers: 0,
  newCustomers: 0
})

// 客户数据列表
const customers = ref<Customer[]>([])

// 表单引用
const customerFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()

// 添加/编辑客户对话框
const customerDialog = reactive({
  visible: false,
  isEdit: false,
  form: {
    id: '',
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    remark: ''
  },
  rules: {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== customerDialog.form.password) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
})

// 客户详情对话框
const detailDialog = reactive({
  visible: false,
  activeTab: 'info',
  customer: null as Customer | null,
  recentOrders: [] as Order[]
})

// 重置密码对话框
const resetDialog = reactive({
  visible: false,
  customer: null as Customer | null,
  form: {
    newPassword: '',
    confirmPassword: ''
  },
  rules: {
    confirmPassword: [
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (resetDialog.form.newPassword && value !== resetDialog.form.newPassword) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
})

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  let result = [...customers.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (customer: Customer) => 
        customer.username.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        String(customer.id).includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter((customer: Customer) => customer.status === statusFilter.value)
  }
  
  return result
})

// 分页后的客户列表
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCustomers.value.slice(start, end)
})

// 生命周期钩子
onMounted(() => {
  cleanupFakeOrderData()
  loadCustomers()
  updateStats()
})

// 加载客户数据
const loadCustomers = async () => {
  loading.value = true;
  
  try {
    // 从API获取用户数据
    const users = await apiService.getAllUsers();
    
    // 过滤出普通用户（角色为user）
    const clientUsers = users
      .filter((user: any) => user.role === 'user')
      .map((user: any) => {
        // 获取用户的订单数据
        const orderStats = getUserOrderStats(user.id);
        
        return {
          id: user.id,
          username: user.username,
          name: user.username, // 用户名作为姓名
          phone: user.phone || '',
          email: user.email || '',
          status: user.status || 'active',
          balance: user.balance || orderStats.balance || 0,
          totalRecharge: orderStats.totalRecharge || 0,
          totalWithdraw: orderStats.totalWithdraw || 0,
          rechargeCount: orderStats.rechargeCount || 0,
          withdrawCount: orderStats.withdrawCount || 0,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt || null,
          remark: user.remark || ''
        } as Customer;
      });
    
    customers.value = clientUsers;
    console.log(`已加载 ${clientUsers.length} 个客户数据`);
  } catch (error) {
    console.error('加载客户数据失败:', error);
    // 如果API加载失败，尝试从localStorage加载
    try {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const allUsers = JSON.parse(storedUsers);
        // 过滤出客户角色的用户
        const clientUsers = allUsers
          .filter((user: any) => user.role === 'user')
          .map((user: any) => {
            // 获取用户的订单数据
            const orderStats = getUserOrderStats(user.id);
            
            return {
              id: user.id,
              username: user.username,
              name: user.username, // 用户名作为姓名
              phone: user.phone || '',
              email: user.email || '',
              status: user.status || 'active',
              balance: orderStats.balance || 0,
              totalRecharge: orderStats.totalRecharge || 0,
              totalWithdraw: orderStats.totalWithdraw || 0,
              rechargeCount: orderStats.rechargeCount || 0,
              withdrawCount: orderStats.withdrawCount || 0,
              createdAt: user.createdAt || new Date().toISOString(),
              lastLoginAt: user.lastLoginAt || null,
              remark: user.remark || ''
            } as Customer;
          });
        
        customers.value = clientUsers;
        console.log(`已从本地存储加载 ${clientUsers.length} 个客户数据`);
      } else {
        customers.value = [];
        console.log('未找到客户数据');
      }
    } catch (localError) {
      console.error('从本地加载客户数据失败:', localError);
      customers.value = [];
      ElMessage.error('加载客户数据失败');
    }
  } finally {
    loading.value = false;
    // 更新统计数据
    updateStats();
  }
};

// 获取用户订单统计
const getUserOrderStats = (userId: string | number) => {
  try {
    // 从localStorage获取订单数据
    const storedOrders = localStorage.getItem('realOrders')
    if (!storedOrders) return { balance: 0, totalRecharge: 0, totalWithdraw: 0, rechargeCount: 0, withdrawCount: 0 }
    
    const orders = JSON.parse(storedOrders)
    if (!Array.isArray(orders)) return { balance: 0, totalRecharge: 0, totalWithdraw: 0, rechargeCount: 0, withdrawCount: 0 }
    
    // 筛选用户的订单
    const userOrders = orders.filter(order => String(order.customerId) === String(userId))
    
    // 计算统计数据
    let totalRecharge = 0
    let totalWithdraw = 0
    let rechargeCount = 0
    let withdrawCount = 0
    
    userOrders.forEach(order => {
      if (order.type === 'recharge' && order.status === 'recharge_completed') {
        totalRecharge += Number(order.amount) || 0
        rechargeCount++
      } else if (order.type === 'withdraw' && order.status === 'withdraw_completed') {
        totalWithdraw += Number(order.amount) || 0
        withdrawCount++
      }
    })
    
    // 计算余额，确保不为负数（新用户默认为0）
    const balance = Math.max(0, totalRecharge - totalWithdraw)
    
    return {
      balance,
      totalRecharge,
      totalWithdraw,
      rechargeCount,
      withdrawCount
    }
  } catch (error) {
    console.error('获取用户订单统计失败:', error)
    return { balance: 0, totalRecharge: 0, totalWithdraw: 0, rechargeCount: 0, withdrawCount: 0 }
  }
}

// 获取用户的最近订单
const generateMockOrders = (customerId: string | number, count = 5) => {
  // 从localStorage获取订单数据
  try {
    const storedOrders = localStorage.getItem('realOrders')
    if (!storedOrders) return []
    
    const orders = JSON.parse(storedOrders)
    if (!Array.isArray(orders)) return []
    
    // 筛选用户的订单
    const userOrders = orders
      .filter(order => String(order.customerId) === String(customerId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count)
    
    return userOrders
  } catch (error) {
    console.error('获取用户订单数据失败:', error)
    return []
  }
}

// 更新客户统计数据
const updateStats = () => {
  // 计算统计数据
  stats.totalCustomers = customers.value.length
  stats.activeCustomers = customers.value.filter(c => c.status === 'active').length
  
  // 今日新增 - 判断创建日期是否是今天
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  stats.newCustomers = customers.value.filter(c => {
    const createDate = new Date(c.createdAt)
    return createDate >= today
  }).length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 处理表格行点击
const handleRowClick = (row: Customer) => {
  viewCustomerDetails(row)
}

// 查看客户详情
const viewCustomerDetails = (customer: Customer) => {
  detailDialog.customer = { ...customer }
  detailDialog.recentOrders = generateMockOrders(customer.id)
  detailDialog.visible = true
  detailDialog.activeTab = 'info'
}

// 查看客户订单
const viewCustomerOrders = (customer: Customer) => {
  // 跳转到订单管理页面，并传递客户ID参数
  router.push({
    path: '/admin/orders',
    query: { customerId: customer.id, customerName: customer.name }
  })
}

// 添加客户
const handleCreateCustomer = () => {
  customerDialog.isEdit = false
  customerDialog.form = {
    id: '',
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    remark: ''
  }
  customerDialog.visible = true
}

// 编辑客户
const editCustomer = (customer: Customer) => {
  customerDialog.isEdit = true
  // 将customer转换为表单需要的格式
  customerDialog.form = {
    id: String(customer.id), // 强制转换为string
    username: customer.username,
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || '',
    password: '',
    confirmPassword: '',
    status: customer.status,
    remark: customer.remark || ''
  }
  customerDialog.visible = true
  
  // 关闭详情对话框
  if (detailDialog.visible) {
    detailDialog.visible = false
  }
}

// 提交客户表单
const submitCustomerForm = async () => {
  if (!customerFormRef.value) return
  
  await customerFormRef.value.validate((valid: boolean) => {
    if (valid) {
      try {
        // 从localStorage获取用户数据
        const storedUsers = localStorage.getItem('users')
        let users = storedUsers ? JSON.parse(storedUsers) : []
        
        if (!Array.isArray(users)) {
          users = []
        }
        
        if (customerDialog.isEdit) {
          // 更新已有客户
          const index = users.findIndex((u: any) => u.id === customerDialog.form.id)
          if (index !== -1) {
            users[index] = { 
              ...users[index],
              username: customerDialog.form.username,
              name: customerDialog.form.name,
              phone: customerDialog.form.phone,
              email: customerDialog.form.email,
              status: customerDialog.form.status,
              remark: customerDialog.form.remark,
            }
            
            // 更新本地数据
            localStorage.setItem('users', JSON.stringify(users))
            
            // 更新页面显示的数据
            const customerIndex = customers.value.findIndex(c => c.id === customerDialog.form.id)
            if (customerIndex !== -1) {
              customers.value[customerIndex] = { ...customers.value[customerIndex], ...customerDialog.form }
            }
            
            ElMessage.success('客户信息已更新')
          }
        } else {
          // 创建新客户
          const newId = users.length > 0 ? Math.max(...users.map((u: any) => Number(u.id))) + 1 : 1
          
          // 创建新用户对象
          const newUser = {
            id: newId,
            username: customerDialog.form.username,
            password: customerDialog.form.password,
            role: 'client',
            createdAt: new Date().toISOString(),
            phone: customerDialog.form.phone,
            email: customerDialog.form.email,
            status: customerDialog.form.status,
            remark: customerDialog.form.remark
          }
          
          // 添加到用户列表
          users.push(newUser)
          
          // 更新本地存储
          localStorage.setItem('users', JSON.stringify(users))
          
          // 更新页面显示的数据
          const newCustomer: Customer = {
            ...customerDialog.form,
            id: newId,
            balance: 0,
            totalRecharge: 0,
            totalWithdraw: 0,
            rechargeCount: 0,
            withdrawCount: 0,
            createdAt: new Date().toISOString(),
            lastLoginAt: null
          } as Customer
          
          customers.value.push(newCustomer)
          ElMessage.success('客户已创建成功')
        }
        
        // 更新统计数据
        updateStats()
        
        // 关闭对话框
        customerDialog.visible = false
      } catch (error) {
        console.error('保存客户数据失败:', error)
        ElMessage.error('保存客户数据失败')
      }
    }
  })
}

// 重置密码
const resetPassword = (customer: Customer) => {
  resetDialog.customer = customer
  resetDialog.form = {
    newPassword: '',
    confirmPassword: ''
  }
  resetDialog.visible = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  if (!resetFormRef.value || !resetDialog.customer) return
  
  await resetFormRef.value.validate((valid: boolean) => {
    if (valid) {
      try {
        // 获取用户数据
        const storedUsers = localStorage.getItem('users')
        let users = storedUsers ? JSON.parse(storedUsers) : []
        
        if (!Array.isArray(users)) {
          users = []
          throw new Error('用户数据格式错误')
        }
        
        // 生成新密码
        const newPassword = resetDialog.form.newPassword || generateRandomPassword()
        
        if (!resetDialog.customer) {
          throw new Error('客户信息丢失')
        }
        
        // 更新用户密码
        const userIndex = users.findIndex((u: any) => u.id === resetDialog.customer!.id)
        if (userIndex !== -1) {
          users[userIndex].password = newPassword
          
          // 保存到本地存储
          localStorage.setItem('users', JSON.stringify(users))
          
          ElMessageBox.alert(
            `客户 ${resetDialog.customer.name} 的密码已重置为: <strong>${newPassword}</strong>`,
            '密码重置成功',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              callback: () => {
                resetDialog.visible = false
              }
            }
          )
        } else {
          throw new Error('未找到指定用户')
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        ElMessage.error('重置密码失败: ' + (error as Error).message)
      }
    }
  })
}

// 生成随机密码
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// 格式化日期
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '未知'
  
  if (typeof date === 'string') {
    // 如果已经是格式化的字符串，直接返回
    if (date.includes('-') && date.includes(':')) return date
    
    // 否则转换为Date对象
    date = new Date(date)
  }
  
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000 / 60 / 60 / 24 // 差距天数
  
  if (diff < 1) {
    // 不到一天显示具体时间
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } else if (diff < 7) {
    // 不到7天显示x天前
    return `${Math.floor(diff)}天前`
  } else {
    // 超过7天显示具体日期
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

// 格式化货币
const formatCurrency = (value: number | string | null | undefined) => {
  if (value === undefined || value === null) return '¥0.00'
  return `¥${Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  if (status?.includes('completed')) return 'success'
  if (status?.includes('processing')) return 'warning'
  if (status?.includes('pending')) return 'info'
  if (status?.includes('failed')) return 'danger'
  return 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'recharge_pending': '充值待处理',
    'recharge_processing': '充值处理中',
    'recharge_completed': '充值完成',
    'recharge_failed': '充值失败',
    'withdraw_pending': '提现待处理',
    'withdraw_processing': '提现处理中',
    'withdraw_completed': '提现完成',
    'withdraw_failed': '提现失败'
  }
  return statusMap[status] || status
}

// 清除本地存储中的虚假订单数据
const cleanupFakeOrderData = () => {
  try {
    const storedOrders = localStorage.getItem('realOrders')
    if (!storedOrders) return
    
    const orders = JSON.parse(storedOrders)
    if (!Array.isArray(orders)) return
    
    // 筛选出真实订单或将无效订单的金额设为0
    const cleanedOrders = orders.map(order => {
      // 如果是系统生成的模拟数据(没有正确对应到用户)，将金额重置为合理值
      if (!order.customerId || order.customerId === 'undefined') {
        return {
          ...order,
          amount: 0
        }
      }
      
      // 确保提现订单不会导致账户余额为负
      if (order.type === 'withdraw') {
        // 获取该用户的充值总额
        const userRechargeTotal = orders
          .filter(o => o.customerId === order.customerId && 
                   o.type === 'recharge' && 
                   o.status === 'recharge_completed')
          .reduce((total, o) => total + Number(o.amount || 0), 0)
        
        // 获取该用户已完成的提现总额(不包括当前订单)
        const userWithdrawTotal = orders
          .filter(o => o.customerId === order.customerId && 
                   o.type === 'withdraw' && 
                   o.status === 'withdraw_completed' &&
                   o.id !== order.id)
          .reduce((total, o) => total + Number(o.amount || 0), 0)
        
        const availableBalance = userRechargeTotal - userWithdrawTotal
        
        // 如果可用余额小于提现金额，调整提现金额
        if (availableBalance < Number(order.amount) && order.status === 'withdraw_completed') {
          return {
            ...order,
            amount: Math.max(0, availableBalance)
          }
        }
      }
      
      return order
    })
    
    // 保存回本地存储
    localStorage.setItem('realOrders', JSON.stringify(cleanedOrders))
  } catch (error) {
    console.error('清理订单数据失败:', error)
  }
}
</script>

<style scoped>
.customer-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 280px;
  transition: all 0.3s;
}

.search-input:focus-within {
  width: 320px;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  display: flex;
  overflow: hidden;
  transition: all 0.3s;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #52c41a 0%, #85e649 100%);
}

.stat-icon.new {
  background: linear-gradient(135deg, #faad14 0%, #ffec3d 100%);
}

.stat-content {
  flex: 1;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 客户列表卡片 */
.customer-list-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  width: 140px;
}

.table-container {
  margin-top: 10px;
}

/* 展开行样式 */
.expanded-row {
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 4px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 最后活动样式 */
.last-activity {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 13px;
  color: #909399;
}

/* 分页容器 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 15px 0;
}

/* 详情页中的查看全部链接 */
.view-all-link {
  margin-top: 15px;
  text-align: center;
}

.language-switcher-container {
  margin-right: 15px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .stat-card {
    margin-bottom: 15px;
  }
  
  .expanded-row {
    padding: 15px;
  }
  
  .stat-icon {
    width: 80px;
    font-size: 24px;
  }
  
  .stat-content {
    padding: 15px 10px;
  }
  
  .stat-value {
    font-size: 24px;
  }

  .language-switcher-container {
    margin: 10px 0;
  }
}

@media (max-width: 576px) {
  .page-header h2 {
    font-size: 20px;
  }
  
  .stat-cards .el-col {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
}
</style> 