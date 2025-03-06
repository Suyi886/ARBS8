<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>
    
    <el-tabs v-model="activeTab" tab-position="left" class="settings-tabs">
      <!-- 系统配置 -->
      <el-tab-pane label="系统配置" name="system">
        <div class="tab-header">
          <h3>系统配置</h3>
          <p>基本系统配置选项</p>
        </div>
        
        <el-form label-width="160px" class="settings-form">
          <el-form-item label="系统名称">
            <el-input v-model="systemSettings.name" placeholder="输入系统名称" />
          </el-form-item>
          
          <el-form-item label="系统描述">
            <el-input 
              v-model="systemSettings.description" 
              type="textarea" 
              rows="2"
              placeholder="输入系统描述" 
            />
          </el-form-item>
          
          <el-form-item label="维护模式">
            <el-switch 
              v-model="systemSettings.maintenanceMode" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="维护信息" v-if="systemSettings.maintenanceMode">
            <el-input 
              v-model="systemSettings.maintenanceMessage" 
              type="textarea" 
              rows="2"
              placeholder="输入维护期间显示的信息" 
            />
          </el-form-item>
          
          <el-form-item label="默认货币">
            <el-select v-model="systemSettings.currency" placeholder="选择默认货币">
              <el-option label="人民币 (CNY)" value="CNY" />
              <el-option label="美元 (USD)" value="USD" />
              <el-option label="欧元 (EUR)" value="EUR" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时区">
            <el-select v-model="systemSettings.timezone" placeholder="选择时区">
              <el-option label="北京时间 (UTC+8)" value="UTC+8" />
              <el-option label="格林威治时间 (UTC+0)" value="UTC+0" />
              <el-option label="美国东部时间 (UTC-5)" value="UTC-5" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveSystemSettings" :loading="saving">保存设置</el-button>
            <el-button @click="resetForm('system')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 支付设置 -->
      <el-tab-pane label="支付设置" name="payment">
        <div class="tab-header">
          <h3>支付设置</h3>
          <p>配置支付方式和处理规则</p>
        </div>
        
        <el-form label-width="160px" class="settings-form">
          <h4 class="settings-section-title">充值设置</h4>
          
          <el-form-item label="最小充值金额">
            <el-input-number 
              v-model="paymentSettings.minRechargeAmount" 
              :min="0" 
              :precision="2" 
              :step="100"
            />
          </el-form-item>
          
          <el-form-item label="最大充值金额">
            <el-input-number 
              v-model="paymentSettings.maxRechargeAmount" 
              :min="0" 
              :precision="2" 
              :step="1000"
            />
          </el-form-item>
          
          <el-form-item label="启用的支付方式">
            <el-checkbox-group v-model="paymentSettings.enabledPaymentMethods">
              <el-checkbox label="wechat">微信支付</el-checkbox>
              <el-checkbox label="alipay">支付宝</el-checkbox>
              <el-checkbox label="bank">银行转账</el-checkbox>
              <el-checkbox label="crypto" disabled>加密货币支付</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <h4 class="settings-section-title">提现设置</h4>
          
          <el-form-item label="最小提现金额">
            <el-input-number 
              v-model="paymentSettings.minWithdrawAmount" 
              :min="0" 
              :precision="2" 
              :step="100"
            />
          </el-form-item>
          
          <el-form-item label="最大提现金额">
            <el-input-number 
              v-model="paymentSettings.maxWithdrawAmount" 
              :min="0" 
              :precision="2" 
              :step="1000"
            />
          </el-form-item>
          
          <el-form-item label="每日提现限额">
            <el-input-number 
              v-model="paymentSettings.dailyWithdrawLimit" 
              :min="0" 
              :precision="2" 
              :step="10000"
            />
          </el-form-item>
          
          <el-form-item label="提现手续费">
            <el-input-number 
              v-model="paymentSettings.withdrawFeeRate" 
              :min="0" 
              :max="100" 
              :precision="2" 
              :step="0.1"
            />
            <span class="unit">%</span>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="savePaymentSettings" :loading="saving">保存设置</el-button>
            <el-button @click="resetForm('payment')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notification">
        <div class="tab-header">
          <h3>通知设置</h3>
          <p>配置系统通知和消息提醒</p>
        </div>
        
        <el-form label-width="200px" class="settings-form">
          <h4 class="settings-section-title">客户通知</h4>
          
          <el-form-item label="新订单通知">
            <el-switch 
              v-model="notificationSettings.newOrderNotification" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="订单状态变更通知">
            <el-switch 
              v-model="notificationSettings.orderStatusChangeNotification" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="系统维护通知">
            <el-switch 
              v-model="notificationSettings.maintenanceNotification" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <h4 class="settings-section-title">管理员通知</h4>
          
          <el-form-item label="新订单提醒">
            <el-switch 
              v-model="notificationSettings.adminNewOrderAlert" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="异常登录提醒">
            <el-switch 
              v-model="notificationSettings.adminLoginAlert" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="大额交易提醒">
            <el-switch 
              v-model="notificationSettings.adminLargeTransactionAlert" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="大额交易阈值" v-if="notificationSettings.adminLargeTransactionAlert">
            <el-input-number 
              v-model="notificationSettings.largeTransactionThreshold" 
              :min="1000" 
              :step="1000"
              :precision="2"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveNotificationSettings" :loading="saving">保存设置</el-button>
            <el-button @click="resetForm('notification')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <div class="tab-header">
          <h3>安全设置</h3>
          <p>配置系统安全参数</p>
        </div>
        
        <el-form label-width="200px" class="settings-form">
          <h4 class="settings-section-title">登录安全</h4>
          
          <el-form-item label="启用登录验证码">
            <el-switch 
              v-model="securitySettings.enableCaptcha" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="登录失败锁定">
            <el-switch 
              v-model="securitySettings.loginLockEnabled" 
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-form-item label="失败尝试次数" v-if="securitySettings.loginLockEnabled">
            <el-input-number 
              v-model="securitySettings.maxLoginAttempts" 
              :min="1" 
              :max="10" 
              :step="1"
            />
          </el-form-item>
          
          <el-form-item label="锁定时间(分钟)" v-if="securitySettings.loginLockEnabled">
            <el-input-number 
              v-model="securitySettings.lockDuration" 
              :min="5" 
              :max="1440" 
              :step="5"
            />
          </el-form-item>
          
          <h4 class="settings-section-title">会话安全</h4>
          
          <el-form-item label="会话超时时间(分钟)">
            <el-input-number 
              v-model="securitySettings.sessionTimeout" 
              :min="5" 
              :max="1440" 
              :step="5"
            />
          </el-form-item>
          
          <el-form-item label="同时登录会话数限制">
            <el-input-number 
              v-model="securitySettings.maxConcurrentSessions" 
              :min="1" 
              :max="10" 
              :step="1"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveSecuritySettings" :loading="saving">保存设置</el-button>
            <el-button @click="resetForm('security')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="users">
        <div class="tab-header">
          <h3>用户管理</h3>
          <p>管理系统用户和权限</p>
        </div>
        
        <div class="user-table-actions">
          <el-button type="primary" @click="showAddUserDialog">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
          <el-input
            v-model="userSearchQuery"
            placeholder="搜索用户名或ID"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <el-table
          :data="filteredUsers"
          stripe
          class="user-table"
          v-loading="loadingUsers"
        >
          <el-table-column label="ID" prop="id" min-width="80" />
          <el-table-column label="用户名" prop="username" min-width="120" />
          <el-table-column label="角色" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
                {{ scope.row.role === 'admin' ? '管理员' : '客户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" prop="createdAt" min-width="120" />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="editUser(scope.row)">
                编辑
              </el-button>
              <el-button 
                link 
                :type="scope.row.status === 'active' ? 'danger' : 'success'" 
                size="small" 
                @click="toggleUserStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="deleteUser(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalUsers"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addUserDialogVisible"
      title="添加新用户"
      width="500px"
    >
      <el-form 
        :model="newUser" 
        :rules="userFormRules" 
        ref="userFormRef" 
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="newUser.password" 
            type="password" 
            show-password 
            placeholder="请输入密码" 
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="newUser.confirmPassword" 
            type="password" 
            show-password 
            placeholder="请再次输入密码" 
          />
        </el-form-item>
        
        <el-form-item label="用户角色" prop="role">
          <el-radio-group v-model="newUser.role">
            <el-radio label="client">客户</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser" :loading="addingUser">创建用户</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 活动标签页
const activeTab = ref('system')

// 保存状态
const saving = ref(false)

// 系统设置
const systemSettings = reactive({
  name: 'ARBS8 支付系统',
  description: '安全可靠的支付管理解决方案',
  maintenanceMode: false,
  maintenanceMessage: '系统维护中，预计1小时后恢复',
  currency: 'CNY',
  timezone: 'UTC+8'
})

// 支付设置
const paymentSettings = reactive({
  minRechargeAmount: 100,
  maxRechargeAmount: 50000,
  enabledPaymentMethods: ['wechat', 'alipay', 'bank'],
  minWithdrawAmount: 100,
  maxWithdrawAmount: 50000,
  dailyWithdrawLimit: 100000,
  withdrawFeeRate: 0.5
})

// 通知设置
const notificationSettings = reactive({
  newOrderNotification: true,
  orderStatusChangeNotification: true,
  maintenanceNotification: true,
  adminNewOrderAlert: true,
  adminLoginAlert: true,
  adminLargeTransactionAlert: true,
  largeTransactionThreshold: 10000
})

// 安全设置
const securitySettings = reactive({
  enableCaptcha: true,
  loginLockEnabled: true,
  maxLoginAttempts: 5,
  lockDuration: 30,
  sessionTimeout: 60,
  maxConcurrentSessions: 3
})

// 用户管理
const users = ref([
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-01'
  },
  {
    id: 2,
    username: 'user1',
    role: 'client',
    status: 'active',
    createdAt: '2023-01-02'
  },
  {
    id: 3,
    username: 'user2',
    role: 'client',
    status: 'inactive',
    createdAt: '2023-01-03'
  },
  {
    id: 4,
    username: 'manager1',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-04'
  },
  {
    id: 5,
    username: 'user3',
    role: 'client',
    status: 'active',
    createdAt: '2023-01-05'
  }
])
const loadingUsers = ref(false)
const userSearchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(15)

// 筛选用户
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  
  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) || 
    user.id.toString().includes(query)
  )
})

// 用户表单
const addUserDialogVisible = ref(false)
const userFormRef = ref<FormInstance>()
const addingUser = ref(false)

const newUser = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'client'
})

// 验证两次输入密码是否一致
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== newUser.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
}

// 显示添加用户对话框
const showAddUserDialog = () => {
  // 重置表单
  Object.assign(newUser, {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  })
  
  addUserDialogVisible.value = true
}

// 添加新用户
const addUser = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    addingUser.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 检查用户名是否已存在
    const userExists = users.value.some(user => user.username === newUser.username)
    if (userExists) {
      ElMessage.error(`用户名 "${newUser.username}" 已存在`)
      addingUser.value = false
      return
    }
    
    // 生成新用户ID
    const maxId = Math.max(...users.value.map(user => user.id))
    const newId = maxId + 1
    
    // 添加新用户到列表
    users.value.push({
      id: newId,
      username: newUser.username,
      role: newUser.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    })
    
    addUserDialogVisible.value = false
    ElMessage.success('用户创建成功')
    
  } catch (error) {
    console.error('添加用户失败:', error)
    ElMessage.error('添加用户失败，请检查表单信息')
  } finally {
    addingUser.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  // 模拟加载设置
  setTimeout(() => {
    // 设置已加载
  }, 500)
})

// 保存系统设置
const saveSystemSettings = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('系统设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 保存支付设置
const savePaymentSettings = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('支付设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('通知设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 保存安全设置
const saveSecuritySettings = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('安全设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = (type: string) => {
  ElMessageBox.confirm('确定要重置为默认设置吗？', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (type === 'system') {
      systemSettings.name = 'ARBS8 支付系统'
      systemSettings.description = '安全可靠的支付管理解决方案'
      systemSettings.maintenanceMode = false
      systemSettings.maintenanceMessage = '系统维护中，预计1小时后恢复'
      systemSettings.currency = 'CNY'
      systemSettings.timezone = 'UTC+8'
    } else if (type === 'payment') {
      paymentSettings.minRechargeAmount = 100
      paymentSettings.maxRechargeAmount = 50000
      paymentSettings.enabledPaymentMethods = ['wechat', 'alipay', 'bank']
      paymentSettings.minWithdrawAmount = 100
      paymentSettings.maxWithdrawAmount = 50000
      paymentSettings.dailyWithdrawLimit = 100000
      paymentSettings.withdrawFeeRate = 0.5
    } else if (type === 'notification') {
      notificationSettings.newOrderNotification = true
      notificationSettings.orderStatusChangeNotification = true
      notificationSettings.maintenanceNotification = true
      notificationSettings.adminNewOrderAlert = true
      notificationSettings.adminLoginAlert = true
      notificationSettings.adminLargeTransactionAlert = true
      notificationSettings.largeTransactionThreshold = 10000
    } else if (type === 'security') {
      securitySettings.enableCaptcha = true
      securitySettings.loginLockEnabled = true
      securitySettings.maxLoginAttempts = 5
      securitySettings.lockDuration = 30
      securitySettings.sessionTimeout = 60
      securitySettings.maxConcurrentSessions = 3
    }
    
    ElMessage.success('设置已重置为默认值')
  }).catch(() => {})
}

// 用户管理相关方法
const editUser = (user: any) => {
  console.log('Edit user:', user)
  // 这里可以打开编辑对话框
  ElMessage.info('用户编辑功能开发中')
}

const toggleUserStatus = (user: any) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定要${actionText}用户 "${user.username}" 吗？`, `${actionText}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API调用
    setTimeout(() => {
      user.status = newStatus
      ElMessage.success(`用户已${actionText}`)
    }, 500)
  }).catch(() => {})
}

const deleteUser = (user: any) => {
  ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 模拟API调用
    setTimeout(() => {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value.splice(index, 1)
        ElMessage.success('用户已删除')
      }
    }, 500)
  }).catch(() => {})
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  // 刷新用户列表
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  // 刷新用户列表
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.settings-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.tab-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.tab-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.tab-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.settings-form {
  max-width: 800px;
}

.settings-section-title {
  margin: 20px 0 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
  color: #606266;
}

.unit {
  margin-left: 8px;
  color: #606266;
}

/* 用户管理 */
.user-table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 250px;
}

.user-table {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-tabs {
    padding: 10px;
  }
  
  .settings-form {
    max-width: 100%;
  }
  
  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
  
  .user-table-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
}
</style> 