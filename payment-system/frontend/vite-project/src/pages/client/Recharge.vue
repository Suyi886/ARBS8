<template>
  <div class="recharge-page">
    <div class="page-header">
      <h2>申请充值</h2>
    </div>
    
    <div class="recharge-container">
      <el-card class="recharge-card">
        <el-steps :active="activeStep" finish-status="success" simple>
          <el-step title="填写充值信息" icon="Edit" />
          <el-step title="扫码支付" icon="Money" />
          <el-step title="等待到账" icon="Check" />
        </el-steps>
        
        <!-- 步骤1：填写充值信息 -->
        <div v-if="activeStep === 0" class="step-content">
          <el-form 
            :model="rechargeForm" 
            :rules="rules" 
            ref="rechargeFormRef" 
            label-width="100px"
            class="recharge-form"
          >
            <el-form-item label="充值金额" prop="amount">
              <el-input-number 
                v-model="rechargeForm.amount" 
                :min="100" 
                :max="50000" 
                :step="100"
                :precision="2"
                :controls="false"
                size="large"
                class="amount-input"
              />
              <span class="currency">元</span>
            </el-form-item>
            
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-radio-group v-model="rechargeForm.paymentMethod">
                <el-radio-button label="wechat">
                  <el-icon><ChatDotRound /></el-icon>
                  微信支付
                </el-radio-button>
                <el-radio-button label="alipay">
                  <el-icon><Money /></el-icon>
                  支付宝
                </el-radio-button>
                <el-radio-button label="bank">
                  <el-icon><CreditCard /></el-icon>
                  银行转账
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="充值说明" prop="remark">
              <el-input 
                v-model="rechargeForm.remark" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入充值说明（选填）"
              />
            </el-form-item>
            
            <el-divider>
              <el-icon><InfoFilled /></el-icon>
              温馨提示
            </el-divider>
            
            <div class="tips">
              <p>1. 充值金额最低100元，最高50000元。</p>
              <p>2. 为了方便财务核对，请务必使用您本人的账户进行支付。</p>
              <p>3. 支付完成后，请等待系统确认，一般工作时间内10分钟内到账。</p>
              <p>4. 如有问题，请联系客服：<a href="tel:13800138000">13800138000</a></p>
            </div>
            
            <div class="form-actions">
              <el-button type="primary" @click="submitRecharge" :loading="submitting">
                提交充值申请
              </el-button>
            </div>
          </el-form>
        </div>
        
        <!-- 步骤2：扫码支付 -->
        <div v-if="activeStep === 1" class="step-content payment-step">
          <div class="payment-info">
            <div class="payment-amount">
              充值金额：<span class="highlight">{{ rechargeForm.amount.toFixed(2) }}</span> 元
            </div>
            <div class="payment-order">
              订单号：<span class="order-number">{{ generatedOrderNumber }}</span>
            </div>
          </div>
          
          <div class="payment-qrcode">
            <img :src="getQRCodeUrl()" class="qrcode-img" alt="支付二维码" />
            <div class="qrcode-tip">
              请使用{{ getPaymentMethodName() }}扫描上方二维码支付
            </div>
          </div>
          
          <div class="payment-actions">
            <el-button @click="activeStep = 0">返回修改</el-button>
            <el-button type="primary" @click="confirmPayment">
              我已完成支付
            </el-button>
          </div>
        </div>
        
        <!-- 步骤3：等待到账 -->
        <div v-if="activeStep === 2" class="step-content result-step">
          <div class="result-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          
          <div class="result-title">
            充值申请已提交
          </div>
          
          <div class="result-desc">
            <p>您的充值订单已提交成功，请耐心等待系统确认。</p>
            <p>订单号：{{ generatedOrderNumber }}</p>
            <p>充值金额：{{ rechargeForm.amount.toFixed(2) }} 元</p>
          </div>
          
          <div class="result-actions">
            <el-button @click="viewOrder">查看订单</el-button>
            <el-button type="primary" @click="resetForm">继续充值</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card class="recharge-history">
        <template #header>
          <div class="card-header">
            <span>最近充值记录</span>
            <el-button link @click="viewAllOrders">查看全部</el-button>
          </div>
        </template>
        
        <div class="history-list" v-loading="loadingHistory">
          <div v-for="item in recentRecharges" :key="item.orderNumber" class="history-item">
            <div class="history-info">
              <div class="history-amount">{{ item.amount }} 元</div>
              <div class="history-order">{{ item.orderNumber }}</div>
              <div class="history-time">{{ formatDate(item.createdAt) }}</div>
            </div>
            <div class="history-status">
              <el-tag :type="getStatusType(item.status)">
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
          </div>
          
          <el-empty v-if="recentRecharges.length === 0" description="暂无充值记录" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { 
  Money, 
  CreditCard, 
  ChatDotRound, 
  InfoFilled, 
  CircleCheck, 
  Edit, 
  Check 
} from '@element-plus/icons-vue';
import { webSocketService } from '@/utils/websocket';

const router = useRouter();
const activeStep = ref(0);
const submitting = ref(false);
const loadingHistory = ref(false);
const rechargeFormRef = ref<FormInstance>();
const generatedOrderNumber = ref('');

// 充值表单
const rechargeForm = reactive({
  amount: 1000,
  paymentMethod: 'alipay',
  remark: ''
});

// 表单验证规则
const rules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 100, max: 50000, message: '充值金额必须在100-50000元之间', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
};

// 最近充值记录
const recentRecharges = ref([
  {
    orderNumber: 'R202403010001',
    amount: '1000.00',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'recharge_completed'
  },
  {
    orderNumber: 'R202402280002',
    amount: '2000.00',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'recharge_completed'
  },
  {
    orderNumber: 'R202402250003',
    amount: '500.00',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    status: 'recharge_failed'
  }
]);

// 生命周期钩子
onMounted(() => {
  fetchRecentRecharges();
});

// 获取最近充值记录
const fetchRecentRecharges = async () => {
  loadingHistory.value = true;
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 实际项目中应该从API获取数据
    // recentRecharges.value = await api.getRecentRecharges();
  } catch (error) {
    console.error('获取充值记录失败:', error);
    ElMessage.error('获取充值记录失败，请刷新页面重试');
  } finally {
    loadingHistory.value = false;
  }
};

// 提交充值申请
const submitRecharge = async () => {
  if (!rechargeFormRef.value) return;
  
  try {
    await rechargeFormRef.value.validate();
    
    submitting.value = true;
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成订单号
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    generatedOrderNumber.value = `R${year}${month}${day}${random}`;
    
    // 模拟向后端发送通知，创建新订单
    if (webSocketService.getConnectionStatus()) {
      webSocketService.sendMessage({
        type: 'new_order',
        orderId: Date.now(),
        orderNumber: generatedOrderNumber.value,
        type: 'recharge',
        amount: rechargeForm.amount.toFixed(2),
        status: 'recharge_pending',
        timestamp: new Date().toISOString()
      });
    }
    
    // 直接将订单保存到localStorage，供管理端读取
    // 这是一个临时解决方案，实际中应该通过WebSocket和后端数据库处理
    const storedOrders = localStorage.getItem('realOrders');
    let realOrders = storedOrders ? JSON.parse(storedOrders) : [];
    
    // 确保orders是数组
    if (!Array.isArray(realOrders)) {
      realOrders = [];
    }
    
    // 添加新订单
    realOrders.push({
      id: Date.now(),
      orderNumber: generatedOrderNumber.value,
      type: 'recharge',
      amount: rechargeForm.amount.toFixed(2),
      customerName: '当前用户',
      customerAccount: 'customer@example.com',
      status: 'recharge_pending',
      remark: rechargeForm.remark || '用户充值',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: '客户'
    });
    
    // 保存回localStorage
    localStorage.setItem('realOrders', JSON.stringify(realOrders));
    
    // 添加到最近的充值记录
    recentRecharges.value.unshift({
      orderNumber: generatedOrderNumber.value,
      amount: rechargeForm.amount.toFixed(2),
      createdAt: new Date(),
      status: 'recharge_pending'
    });
    
    // 进入下一步
    activeStep.value = 1;
    
    ElMessage.success('充值申请提交成功，已保存到系统中');
  } catch (error) {
    console.error('提交充值申请失败:', error);
    ElMessage.error('提交充值申请失败，请检查表单信息');
  } finally {
    submitting.value = false;
  }
};

// 确认支付
const confirmPayment = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 进入下一步
    activeStep.value = 2;
    
    ElMessage.success('已确认支付，等待系统确认到账');
  } catch (error) {
    console.error('确认支付失败:', error);
    ElMessage.error('确认支付失败，请重试');
  }
};

// 重置表单，开始新的充值
const resetForm = () => {
  if (rechargeFormRef.value) {
    rechargeFormRef.value.resetFields();
  }
  activeStep.value = 0;
  generatedOrderNumber.value = '';
};

// 查看当前订单
const viewOrder = () => {
  router.push('/client/orders');
  // 实际项目中应该跳转至具体订单的详情页
};

// 查看所有订单
const viewAllOrders = () => {
  router.push('/client/orders');
};

// 获取支付方式名称
const getPaymentMethodName = () => {
  const methodMap: Record<string, string> = {
    'wechat': '微信',
    'alipay': '支付宝',
    'bank': '银行APP'
  };
  return methodMap[rechargeForm.paymentMethod] || '';
};

// 获取二维码URL
const getQRCodeUrl = () => {
  // 实际项目中应该根据支付方式和订单信息生成真实的支付二维码
  // 这里使用占位图像
  return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + 
    encodeURIComponent(`充值订单：${generatedOrderNumber.value}，金额：${rechargeForm.amount}元`);
};

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  if (status?.includes('completed')) return 'success';
  if (status?.includes('processing')) return 'warning';
  if (status?.includes('pending')) return 'info';
  if (status?.includes('failed')) return 'danger';
  return 'info';
};

// 根据状态获取显示标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'recharge_pending': '处理中',
    'recharge_processing': '处理中',
    'recharge_completed': '已完成',
    'recharge_failed': '失败'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.recharge-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.recharge-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.recharge-card {
  padding: 20px 0;
}

.step-content {
  margin-top: 40px;
  padding: 0 20px;
}

.recharge-form {
  max-width: 600px;
  margin: 0 auto;
}

.amount-input {
  width: 200px;
}

.currency {
  margin-left: 10px;
  font-size: 16px;
  color: #606266;
}

.tips {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 24px;
}

.tips p {
  margin: 5px 0;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}

/* 支付步骤样式 */
.payment-step {
  text-align: center;
}

.payment-info {
  margin-bottom: 20px;
}

.payment-amount {
  font-size: 18px;
  margin-bottom: 8px;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 20px;
}

.payment-order {
  font-size: 14px;
  color: #606266;
}

.order-number {
  font-family: monospace;
  color: #409eff;
}

.payment-qrcode {
  margin: 20px auto;
  max-width: 280px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  padding: 5px;
}

.qrcode-tip {
  font-size: 14px;
  color: #606266;
}

.payment-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 结果步骤样式 */
.result-step {
  text-align: center;
  padding: 30px 0;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #67c23a;
}

.result-title {
  font-size: 22px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 500;
}

.result-desc {
  color: #606266;
  margin-bottom: 30px;
  line-height: 1.8;
}

.result-desc p {
  margin: 5px 0;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 充值历史样式 */
.recharge-history {
  height: fit-content;
}

.history-list {
  min-height: 200px;
}

.history-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.history-amount {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.history-order {
  font-family: monospace;
  font-size: 13px;
  color: #909399;
  margin-bottom: 3px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

/* 响应式样式 */
@media (max-width: 992px) {
  .recharge-container {
    grid-template-columns: 1fr;
  }
  
  .recharge-history {
    margin-top: 20px;
  }
}

@media (max-width: 576px) {
  .recharge-form {
    padding: 0;
  }
  
  .amount-input {
    width: 100%;
  }
  
  .payment-actions, .result-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .payment-actions button, .result-actions button {
    width: 100%;
  }
}
</style> 