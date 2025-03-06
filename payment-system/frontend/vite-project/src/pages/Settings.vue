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
          
          <h4 class="settings-section-title">测试与开发</h4>
          
          <el-form-item label="模拟数据生成">
            <el-switch 
              v-model="systemSettings.enableMockData" 
              active-text="开启"
              inactive-text="关闭"
              @change="toggleMockData"
            />
            <div class="form-item-help">
              开启后系统将自动生成测试订单和通知，仅用于测试环境
            </div>
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
      
      <!-- 系统信息 -->
      <el-tab-pane label="系统信息" name="system-info">
        <div class="tab-header">
          <h3>系统信息与接入指南</h3>
          <p>关于系统的详细信息和客户接入方法</p>
        </div>
        
        <el-card class="system-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h4>系统概览</h4>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue 3 + TypeScript + Element Plus</el-descriptions-item>
            <el-descriptions-item label="后端技术">Node.js + Express</el-descriptions-item>
            <el-descriptions-item label="数据库">MongoDB</el-descriptions-item>
            <el-descriptions-item label="部署状态">
              <el-tag type="success">正常运行中</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <el-card class="system-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h4>客户接入指南</h4>
            </div>
          </template>
          
          <div class="info-section">
            <h5>1. 客户登录地址</h5>
            <el-input 
              :modelValue="clientUrl" 
              readonly 
              class="info-input"
            >
              <template #append>
                <el-button @click="copyToClipboard(clientUrl)">复制</el-button>
              </template>
            </el-input>
            <p class="info-help">提供给客户访问系统的登录网址</p>
          </div>
          
          <div class="info-section">
            <h5>2. 客户登录凭证</h5>
            <div class="credentials-table">
              <el-table :data="clientCredentials" border style="width: 100%">
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="password" label="密码" width="120">
                  <template #default="scope">
                    <el-input :model-value="scope.row.password" readonly show-password />
                  </template>
                </el-table-column>
                <el-table-column prop="role" label="角色" width="100">
                  <template #default="scope">
                    <el-tag type="success">{{ scope.row.role }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="desc" label="说明" />
              </el-table>
            </div>
            <p class="info-help">创建好的客户账号，可以提供给客户进行测试</p>
          </div>
          
          <div class="info-section">
            <h5>3. API文档</h5>
            <p>本系统提供了以下API接口，可供第三方系统集成：</p>
            <el-collapse>
              <el-collapse-item title="1. 充值接口" name="1">
                <div class="api-info">
                  <p><strong>请求URL：</strong> <code>/api/recharge</code></p>
                  <p><strong>请求方法：</strong> <code>POST</code></p>
                  <p><strong>请求参数：</strong></p>
                  <pre>{
  "amount": "充值金额",
  "paymentMethod": "支付方式",
  "userId": "用户ID",
  "remark": "备注信息"
}</pre>
                  <p><strong>返回示例：</strong></p>
                  <pre>{
  "code": 200,
  "message": "充值订单创建成功",
  "data": {
    "orderNumber": "R202403050001",
    "amount": "1000.00",
    "status": "recharge_pending"
  }
}</pre>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="2. 订单查询接口" name="2">
                <div class="api-info">
                  <p><strong>请求URL：</strong> <code>/api/orders</code></p>
                  <p><strong>请求方法：</strong> <code>GET</code></p>
                  <p><strong>请求参数：</strong></p>
                  <pre>{
  "userId": "用户ID",
  "startDate": "开始日期",
  "endDate": "结束日期",
  "status": "订单状态",
  "type": "订单类型"
}</pre>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="3. WebSocket事件" name="3">
                <div class="api-info">
                  <p><strong>WebSocket连接地址：</strong> <code>ws://localhost:5173/ws</code></p>
                  <p><strong>订单状态变更事件格式：</strong></p>
                  <pre>{
  "orderId": "订单ID",
  "orderNumber": "订单编号",
  "type": "订单类型", // recharge/withdraw
  "oldStatus": "原状态",
  "newStatus": "新状态",
  "timestamp": "时间戳"
}</pre>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <div class="info-section">
            <h5>4. 测试流程指南</h5>
            <ol class="guide-steps">
              <li>客户使用提供的凭证登录系统</li>
              <li>在客户仪表盘页面，点击充值或提现按钮</li>
              <li>填写相应的表单信息并提交</li>
              <li>完成相关操作后，可在订单列表页面查看订单状态</li>
              <li>系统会通过WebSocket实时推送订单状态变更通知</li>
            </ol>
          </div>
        </el-card>
        
        <el-card class="system-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h4>开发者工具</h4>
            </div>
          </template>
          
          <div class="info-section">
            <h5>手动触发订单状态更新</h5>
            <p>用于测试客户接收WebSocket事件的功能</p>
            
            <el-form :model="testEventForm" label-width="120px">
              <el-form-item label="事件类型">
                <el-select v-model="testEventForm.eventType">
                  <el-option label="订单状态变更" value="status_change" />
                  <el-option label="系统通知" value="system_notice" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="testEventForm.eventType === 'status_change'" label="订单号">
                <el-input v-model="testEventForm.orderNumber" placeholder="例如：R202403050001" />
              </el-form-item>
              
              <el-form-item v-if="testEventForm.eventType === 'status_change'" label="订单类型">
                <el-select v-model="testEventForm.orderType">
                  <el-option label="充值" value="recharge" />
                  <el-option label="提现" value="withdraw" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="testEventForm.eventType === 'status_change'" label="新状态">
                <el-select v-model="testEventForm.newStatus">
                  <el-option 
                    v-for="status in getStatusOptions"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="testEventForm.eventType === 'system_notice'" label="通知标题">
                <el-input v-model="testEventForm.title" />
              </el-form-item>
              
              <el-form-item v-if="testEventForm.eventType === 'system_notice'" label="通知内容">
                <el-input v-model="testEventForm.message" type="textarea" rows="2" />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="sendTestEvent" :loading="sendingEvent">
                  发送测试事件
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
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
import { webSocketService } from '@/utils/websocket'

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
  timezone: 'UTC+8',
  enableMockData: false
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
  // 同步模拟数据状态
  systemSettings.enableMockData = webSocketService.getMockDataEnabled()
  
  // 模拟加载设置
  setTimeout(() => {
    // 设置已加载
  }, 500)
})

// 切换模拟数据生成
const toggleMockData = (value: boolean) => {
  webSocketService.setMockDataEnabled(value)
  ElMessage.info(`已${value ? '开启' : '关闭'}模拟数据生成`)
}

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
      systemSettings.enableMockData = false
      webSocketService.setMockDataEnabled(false)
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

// 系统信息和开发者工具
const clientUrl = window.location.origin
const sendingEvent = ref(false)

const clientCredentials = [
  { username: 'user1', password: 'user123', role: '客户', desc: '测试客户账号' },
  { username: 'suyi6', password: '123456', role: '客户', desc: '您的自定义客户账号' }
]

// 测试事件表单
const testEventForm = reactive({
  eventType: 'status_change',
  orderNumber: 'R' + new Date().getFullYear() + '0001',
  orderType: 'recharge',
  newStatus: 'recharge_completed',
  title: '系统通知',
  message: '这是一条测试通知'
})

// 获取状态选项
const getStatusOptions = computed(() => {
  if (testEventForm.orderType === 'recharge') {
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

// 复制文本到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 发送测试事件
const sendTestEvent = async () => {
  if (!webSocketService.getConnectionStatus()) {
    ElMessage.error('WebSocket未连接，无法发送测试事件')
    return
  }
  
  sendingEvent.value = true
  
  try {
    const now = new Date()
    const timestamp = now.toISOString()
    
    if (testEventForm.eventType === 'status_change') {
      // 构造订单状态变更事件
      const statusEvent = {
        orderId: Math.floor(Math.random() * 1000) + 1,
        orderNumber: testEventForm.orderNumber,
        type: testEventForm.orderType as 'recharge' | 'withdraw',
        oldStatus: testEventForm.orderType + '_pending',
        newStatus: testEventForm.newStatus,
        timestamp,
        updatedBy: '管理员',
        message: '订单状态已更新'
      }
      
      webSocketService.manualTriggerEvent(statusEvent)
      ElMessage.success('状态变更事件已发送')
    } else {
      // 构造系统通知事件
      const systemEvent = {
        type: 'system' as const,
        title: testEventForm.title,
        message: testEventForm.message,
        timestamp
      }
      
      webSocketService.manualTriggerEvent(systemEvent)
      ElMessage.success('系统通知事件已发送')
    }
  } catch (error) {
    console.error('发送测试事件失败:', error)
    ElMessage.error('发送测试事件失败')
  } finally {
    sendingEvent.value = false
  }
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

.form-item-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
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

/* 系统信息页面样式 */
.system-info-card {
  margin-bottom: 20px;
}

.system-info-card h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.info-section {
  margin-bottom: 25px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h5 {
  font-size: 15px;
  margin: 0 0 10px 0;
  color: #409eff;
  font-weight: 500;
}

.info-input {
  margin-bottom: 5px;
}

.info-help {
  font-size: 12px;
  color: #909399;
  margin: 5px 0 0 0;
}

.credentials-table {
  margin: 10px 0;
}

.api-info {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.api-info pre {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  font-family: monospace;
  margin: 10px 0;
  overflow-x: auto;
}

.api-info code {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.guide-steps {
  margin: 10px 0;
  padding-left: 20px;
}

.guide-steps li {
  margin-bottom: 8px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .system-info-card {
    margin-bottom: 15px;
  }
  
  .api-info pre {
    font-size: 12px;
  }
}
</style> 