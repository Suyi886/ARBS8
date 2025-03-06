<template>
  <div class="withdraw-page">
    <div class="page-header">
      <h2>申请提现</h2>
    </div>
    
    <div class="withdraw-container">
      <el-card class="withdraw-card">
        <el-steps :active="activeStep" finish-status="success" simple>
          <el-step title="填写提现信息" icon="Edit" />
          <el-step title="确认信息" icon="Document" />
          <el-step title="提交结果" icon="Check" />
        </el-steps>
        
        <!-- 步骤1：填写提现信息 -->
        <div v-if="activeStep === 0" class="step-content">
          <el-form 
            :model="withdrawForm" 
            :rules="rules" 
            ref="withdrawFormRef" 
            label-width="100px"
            class="withdraw-form"
          >
            <div class="account-balance">
              <p>当前账户余额：<span class="balance">￥8,765.50</span></p>
              <p>可提现金额：<span class="available">￥8,765.50</span></p>
            </div>
            
            <el-form-item label="提现金额" prop="amount">
              <el-input-number 
                v-model="withdrawForm.amount" 
                :min="100" 
                :max="8765.50" 
                :step="100"
                :precision="2"
                :controls="false"
                size="large"
                class="amount-input"
              />
              <span class="currency">元</span>
              <div class="amount-tips">
                <el-button type="primary" link @click="setFullAmount">全部提现</el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="银行卡信息" required>
              <div class="bank-card-section">
                <template v-if="selectedCard">
                  <div class="selected-card">
                    <div class="card-info">
                      <div class="card-bank">{{ selectedCard.bankName }}</div>
                      <div class="card-number">{{ maskCardNumber(selectedCard.cardNumber) }}</div>
                      <div class="card-holder">持卡人：{{ selectedCard.holderName }}</div>
                    </div>
                    <div class="card-actions">
                      <el-button type="primary" link @click="selectBankCard">更换银行卡</el-button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <el-button type="primary" @click="selectBankCard">选择银行卡</el-button>
                </template>
              </div>
            </el-form-item>
            
            <el-form-item label="提现说明" prop="remark">
              <el-input 
                v-model="withdrawForm.remark" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入提现说明（选填）"
              />
            </el-form-item>
            
            <el-divider>
              <el-icon><InfoFilled /></el-icon>
              温馨提示
            </el-divider>
            
            <div class="tips">
              <p>1. 提现金额最低100元，单笔最高50000元，当日提现总额不超过10万元。</p>
              <p>2. 提现到账时间：工作日09:00-17:00提交的提现申请一般1小时内到账，非工作时间提交的申请将于下个工作日处理。</p>
              <p>3. 提现仅支持提现到您本人实名认证的银行卡。</p>
              <p>4. 如有问题，请联系客服：<a href="tel:13800138000">13800138000</a></p>
            </div>
            
            <div class="form-actions">
              <el-button type="primary" @click="nextStep" :loading="submitting">
                下一步
              </el-button>
            </div>
          </el-form>
        </div>
        
        <!-- 步骤2：确认信息 -->
        <div v-if="activeStep === 1" class="step-content confirm-step">
          <h3 class="confirm-title">请确认提现信息</h3>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="提现金额">{{ withdrawForm.amount.toFixed(2) }} 元</el-descriptions-item>
            <el-descriptions-item label="收款银行">{{ selectedCard.bankName }}</el-descriptions-item>
            <el-descriptions-item label="收款账号">{{ maskCardNumber(selectedCard.cardNumber) }}</el-descriptions-item>
            <el-descriptions-item label="收款人">{{ selectedCard.holderName }}</el-descriptions-item>
            <el-descriptions-item label="手续费">0.00 元</el-descriptions-item>
            <el-descriptions-item label="实际到账">{{ withdrawForm.amount.toFixed(2) }} 元</el-descriptions-item>
            <el-descriptions-item label="提现说明">{{ withdrawForm.remark || '无' }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="confirm-actions">
            <el-button @click="activeStep = 0">返回修改</el-button>
            <el-button type="primary" @click="submitWithdraw" :loading="submitting">
              确认提交
            </el-button>
          </div>
        </div>
        
        <!-- 步骤3：提交结果 -->
        <div v-if="activeStep === 2" class="step-content result-step">
          <div class="result-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          
          <div class="result-title">
            提现申请已提交
          </div>
          
          <div class="result-desc">
            <p>您的提现申请已提交成功，请耐心等待审核处理。</p>
            <p>订单号：{{ generatedOrderNumber }}</p>
            <p>提现金额：{{ withdrawForm.amount.toFixed(2) }} 元</p>
            <p>预计到账时间：工作时间内1小时内，非工作时间次日处理</p>
          </div>
          
          <div class="result-actions">
            <el-button @click="viewOrder">查看订单</el-button>
            <el-button type="primary" @click="resetForm">继续提现</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card class="withdraw-history">
        <template #header>
          <div class="card-header">
            <span>最近提现记录</span>
            <el-button link @click="viewAllOrders">查看全部</el-button>
          </div>
        </template>
        
        <div class="history-list" v-loading="loadingHistory">
          <div v-for="item in recentWithdraws" :key="item.orderNumber" class="history-item">
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
          
          <el-empty v-if="recentWithdraws.length === 0" description="暂无提现记录" />
        </div>
      </el-card>
    </div>
    
    <!-- 银行卡选择对话框 -->
    <el-dialog
      v-model="bankCardDialog.visible"
      title="选择银行卡"
      width="500px"
    >
      <div class="bank-card-list">
        <div 
          v-for="card in bankCards" 
          :key="card.id"
          class="bank-card-item"
          :class="{ active: bankCardDialog.selectedId === card.id }"
          @click="selectCard(card)"
        >
          <div class="card-info">
            <div class="card-bank">{{ card.bankName }}</div>
            <div class="card-number">{{ maskCardNumber(card.cardNumber) }}</div>
            <div class="card-holder">持卡人：{{ card.holderName }}</div>
          </div>
          <div class="card-select">
            <el-radio v-model="bankCardDialog.selectedId" :label="card.id" />
          </div>
        </div>
        
        <div class="add-card">
          <el-button type="primary" plain icon="Plus">添加新银行卡</el-button>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bankCardDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelectCard">
            确认选择
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { 
  Edit, 
  Document, 
  Check, 
  InfoFilled, 
  CircleCheck, 
  Plus 
} from '@element-plus/icons-vue';
import { webSocketService } from '@/utils/websocket';

interface BankCard {
  id: number;
  bankName: string;
  cardNumber: string;
  holderName: string;
}

const router = useRouter();
const activeStep = ref(0);
const submitting = ref(false);
const loadingHistory = ref(false);
const withdrawFormRef = ref<FormInstance>();
const generatedOrderNumber = ref('');

// 提现表单
const withdrawForm = reactive({
  amount: 1000,
  remark: ''
});

// 银行卡数据
const bankCards = ref<BankCard[]>([
  {
    id: 1,
    bankName: '中国建设银行',
    cardNumber: '6217001234567890123',
    holderName: '张三'
  },
  {
    id: 2,
    bankName: '中国工商银行',
    cardNumber: '6222021234567890123',
    holderName: '张三'
  },
  {
    id: 3,
    bankName: '招商银行',
    cardNumber: '6225881234567890123',
    holderName: '张三'
  }
]);

// 选中的银行卡
const selectedCard = ref<BankCard | null>(bankCards.value[0]);

// 银行卡选择对话框
const bankCardDialog = reactive({
  visible: false,
  selectedId: bankCards.value[0].id
});

// 表单验证规则
const rules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 100, max: 50000, message: '提现金额必须在100-50000元之间', trigger: 'blur' },
    { 
      validator: (rule: any, value: number, callback: any) => {
        if (value > 8765.50) {
          callback(new Error('提现金额不能超过可提现金额'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 最近提现记录
const recentWithdraws = ref([
  {
    orderNumber: 'W202403020001',
    amount: '2000.00',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'withdraw_processing'
  },
  {
    orderNumber: 'W202402250002',
    amount: '1500.00',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'withdraw_completed'
  },
  {
    orderNumber: 'W202402180003',
    amount: '3000.00',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'withdraw_completed'
  }
]);

// 生命周期钩子
onMounted(() => {
  fetchRecentWithdraws();
});

// 获取最近提现记录
const fetchRecentWithdraws = async () => {
  loadingHistory.value = true;
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 实际项目中应该从API获取数据
    // recentWithdraws.value = await api.getRecentWithdraws();
  } catch (error) {
    console.error('获取提现记录失败:', error);
    ElMessage.error('获取提现记录失败，请刷新页面重试');
  } finally {
    loadingHistory.value = false;
  }
};

// 设置全部提现
const setFullAmount = () => {
  withdrawForm.amount = 8765.50;
};

// 银行卡号掩码
const maskCardNumber = (cardNumber: string) => {
  if (!cardNumber) return '';
  return cardNumber.replace(/^(\d{4})\d+(\d{4})$/, '$1 **** **** $2');
};

// 选择银行卡
const selectBankCard = () => {
  bankCardDialog.selectedId = selectedCard.value?.id || 0;
  bankCardDialog.visible = true;
};

// 选择银行卡对话框中选择卡片
const selectCard = (card: BankCard) => {
  bankCardDialog.selectedId = card.id;
};

// 确认选择银行卡
const confirmSelectCard = () => {
  if (bankCardDialog.selectedId) {
    const card = bankCards.value.find(c => c.id === bankCardDialog.selectedId);
    if (card) {
      selectedCard.value = card;
    }
  }
  bankCardDialog.visible = false;
};

// 下一步
const nextStep = async () => {
  if (!withdrawFormRef.value) return;
  
  try {
    await withdrawFormRef.value.validate();
    
    if (!selectedCard.value) {
      ElMessage.warning('请选择收款银行卡');
      return;
    }
    
    // 进入下一步
    activeStep.value = 1;
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 提交提现申请
const submitWithdraw = async () => {
  try {
    submitting.value = true;
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成订单号
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    generatedOrderNumber.value = `W${year}${month}${day}${random}`;
    
    // 模拟向后端发送通知，创建新订单
    if (webSocketService.getConnectionStatus()) {
      webSocketService.sendMessage({
        type: 'new_order',
        orderId: Date.now(),
        orderNumber: generatedOrderNumber.value,
        type: 'withdraw',
        amount: withdrawForm.amount.toFixed(2),
        status: 'withdraw_pending',
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
      type: 'withdraw',
      amount: withdrawForm.amount.toFixed(2),
      customerName: '当前用户',
      customerAccount: 'customer@example.com',
      status: 'withdraw_pending',
      remark: withdrawForm.remark || '用户提现申请',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: '客户'
    });
    
    // 保存回localStorage
    localStorage.setItem('realOrders', JSON.stringify(realOrders));
    
    // 添加到最近的提现记录
    recentWithdraws.value.unshift({
      orderNumber: generatedOrderNumber.value,
      amount: withdrawForm.amount.toFixed(2),
      createdAt: new Date(),
      status: 'withdraw_pending'
    });
    
    // 进入下一步
    activeStep.value = 2;
    
    ElMessage.success('提现申请提交成功，已保存到系统中');
  } catch (error) {
    console.error('提交提现申请失败:', error);
    ElMessage.error('提交提现申请失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 重置表单，开始新的提现
const resetForm = () => {
  if (withdrawFormRef.value) {
    withdrawFormRef.value.resetFields();
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
    'withdraw_pending': '待处理',
    'withdraw_processing': '处理中',
    'withdraw_completed': '已完成',
    'withdraw_failed': '失败'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.withdraw-page {
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

.withdraw-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.withdraw-card {
  padding: 20px 0;
}

.step-content {
  margin-top: 40px;
  padding: 0 20px;
}

.withdraw-form {
  max-width: 600px;
  margin: 0 auto;
}

.account-balance {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.account-balance p {
  margin: 8px 0;
  color: #606266;
}

.balance, .available {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.amount-input {
  width: 200px;
}

.currency {
  margin-left: 10px;
  font-size: 16px;
  color: #606266;
}

.amount-tips {
  margin-top: 5px;
}

.bank-card-section {
  width: 100%;
}

.selected-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.card-info {
  flex: 1;
}

.card-bank {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.card-number {
  font-family: monospace;
  font-size: 16px;
  color: #606266;
  margin-bottom: 5px;
}

.card-holder {
  font-size: 14px;
  color: #909399;
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

/* 确认步骤样式 */
.confirm-step {
  max-width: 600px;
  margin: 0 auto;
}

.confirm-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.confirm-actions {
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

/* 提现历史样式 */
.withdraw-history {
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

/* 银行卡选择对话框样式 */
.bank-card-list {
  padding: 10px 0;
}

.bank-card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.bank-card-item:hover, .bank-card-item.active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.add-card {
  margin-top: 20px;
  text-align: center;
}

/* 响应式样式 */
@media (max-width: 992px) {
  .withdraw-container {
    grid-template-columns: 1fr;
  }
  
  .withdraw-history {
    margin-top: 20px;
  }
}

@media (max-width: 576px) {
  .withdraw-form {
    padding: 0;
  }
  
  .amount-input {
    width: 100%;
  }
  
  .confirm-actions, .result-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .confirm-actions button, .result-actions button {
    width: 100%;
  }
}
</style> 