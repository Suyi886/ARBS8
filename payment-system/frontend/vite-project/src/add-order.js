// 这是一个临时脚本，用于向管理员端添加用户提交的订单
// 在开发者控制台中运行此代码

// 创建包含用户提交的提现订单的JSON对象
const userOrder = {
  id: Date.now(),
  orderNumber: 'W20250306359',
  type: 'withdraw',
  amount: '1000.00',
  customerName: '客户',
  customerAccount: 'user@example.com',
  status: 'withdraw_pending',
  remark: '用户提交的提现申请',
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
  updatedBy: '客户'
};

// 读取已有的订单数据并添加新订单
try {
  // 获取现有订单数据
  const existingOrders = localStorage.getItem('realOrders');
  let orders = existingOrders ? JSON.parse(existingOrders) : [];
  
  // 确保orders是数组
  if (!Array.isArray(orders)) {
    orders = [];
  }
  
  // 添加新订单
  orders.push(userOrder);
  
  // 保存回localStorage
  localStorage.setItem('realOrders', JSON.stringify(orders));
  
  console.log('已添加用户订单到管理员端');
  
  // 通知管理员
  alert('已成功添加用户订单，请刷新页面并切换到"提现订单"选项卡查看');
} catch (error) {
  console.error('添加订单失败:', error);
  alert('添加订单失败: ' + error.message);
} 