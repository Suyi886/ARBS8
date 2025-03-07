<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2>系统概览</h2>
      <div class="header-actions">
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon recharge">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">今日充值总额</div>
              <div class="stat-value">¥{{ formatAmount(stats.todayRechargeAmount) }}</div>
              <div class="stat-count">
                <span>订单数:</span> {{ stats.todayRechargeCount }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon withdraw">
              <el-icon><CreditCard /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">今日提现总额</div>
              <div class="stat-value">¥{{ formatAmount(stats.todayWithdrawAmount) }}</div>
              <div class="stat-count">
                <span>订单数:</span> {{ stats.todayWithdrawCount }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon user">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">总用户数</div>
              <div class="stat-value">{{ stats.totalUserCount }}</div>
              <div class="stat-count">
                <span>今日新增:</span> {{ stats.todayNewUserCount }}
                <el-button link type="primary" size="small" @click="goToCustomers" class="card-action-link">
                  管理客户
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon pending">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">待处理订单</div>
              <div class="stat-value">{{ stats.pendingOrderCount }}</div>
              <div class="stat-count">
                <span>今日新增:</span> {{ stats.todayPendingOrderCount }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <!-- 订单趋势图 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>订单趋势</h3>
                <el-radio-group v-model="orderTrendTimeRange" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" v-loading="loading">
              <div ref="orderTrendChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 收入统计图 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>收入统计</h3>
                <el-radio-group v-model="incomeTimeRange" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" v-loading="loading">
              <div ref="incomeChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="second-row">
        <!-- 订单状态分布 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>订单状态分布</h3>
                <el-select v-model="orderTypeFilter" size="small">
                  <el-option label="所有订单" value="all" />
                  <el-option label="充值订单" value="recharge" />
                  <el-option label="提现订单" value="withdraw" />
                </el-select>
              </div>
            </template>
            <div class="chart-container" v-loading="loading">
              <div ref="orderStatusChart" class="chart pie-chart"></div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 最近活动 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card class="activity-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>最近活动</h3>
              </div>
            </template>
            <div class="activity-timeline" v-loading="loading">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :type="getActivityType(activity.type)"
                  :color="getActivityColor(activity.type)"
                  :timestamp="activity.time"
                  size="large"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </el-col>
        
        <!-- 待处理订单列表 -->
        <el-col :xs="24" :lg="8">
          <el-card class="pending-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>待处理订单</h3>
                <el-button link @click="goToOrderManagement">查看全部</el-button>
              </div>
            </template>
            <div class="pending-list" v-loading="loading">
              <el-empty v-if="pendingOrders.length === 0" description="暂无待处理订单" />
              <el-table
                v-else
                :data="pendingOrders"
                style="width: 100%"
                size="small"
                :show-header="false"
              >
                <el-table-column prop="orderNumber" width="120">
                  <template #default="scope">
                    <span class="order-number">{{ scope.row.orderNumber }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" width="80">
                  <template #default="scope">
                    <span class="amount">¥{{ scope.row.amount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="type">
                  <template #default="scope">
                    <el-tag size="small" :type="scope.row.type === 'recharge' ? 'success' : 'warning'">
                      {{ scope.row.type === 'recharge' ? '充值' : '提现' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" min-width="90">
                  <template #default="scope">
                    <span class="time">{{ formatDate(scope.row.createdAt) }}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" width="50">
                  <template #default="scope">
                    <el-button link type="primary" size="small" @click="handleOrder(scope.row)">
                      处理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Refresh, 
  Money, 
  CreditCard, 
  User, 
  Timer,
  WarningFilled,
  CircleCheckFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import { webSocketService } from '@/utils/websocket'
import * as echarts from 'echarts/core'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent 
} from 'echarts/components'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  BarChart, 
  LineChart, 
  PieChart, 
  CanvasRenderer
])

const router = useRouter()
const loading = ref(false)
const orderTrendTimeRange = ref('week')
const incomeTimeRange = ref('week')
const orderTypeFilter = ref('all')

// 统计数据
const stats = reactive({
  todayRechargeAmount: 12500.00,
  todayRechargeCount: 28,
  todayWithdrawAmount: 8650.00,
  todayWithdrawCount: 15,
  totalUserCount: 1250,
  todayNewUserCount: 12,
  pendingOrderCount: 18,
  todayPendingOrderCount: 8
})

// 图表实例
const orderTrendChart = ref(null)
const incomeChart = ref(null)
const orderStatusChart = ref(null)
let orderTrendChartInstance: echarts.ECharts | null = null
let incomeChartInstance: echarts.ECharts | null = null
let orderStatusChartInstance: echarts.ECharts | null = null

// 待处理订单列表
const pendingOrders = ref([
  {
    id: 1,
    orderNumber: 'R202403050001',
    type: 'recharge',
    amount: '1000.00',
    status: 'recharge_pending',
    createdAt: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    id: 2,
    orderNumber: 'W202403050002',
    type: 'withdraw',
    amount: '2500.00',
    status: 'withdraw_pending',
    createdAt: new Date(Date.now() - 55 * 60 * 1000)
  },
  {
    id: 3,
    orderNumber: 'R202403050003',
    type: 'recharge',
    amount: '5000.00',
    status: 'recharge_pending',
    createdAt: new Date(Date.now() - 120 * 60 * 1000)
  },
  {
    id: 4,
    orderNumber: 'W202403050004',
    type: 'withdraw',
    amount: '1800.00',
    status: 'withdraw_pending',
    createdAt: new Date(Date.now() - 180 * 60 * 1000)
  }
])

// 最近活动
const recentActivities = ref([
  {
    type: 'order',
    content: '新充值订单 R202403050001 已提交',
    time: '10分钟前'
  },
  {
    type: 'system',
    content: '系统自动备份已完成',
    time: '30分钟前'
  },
  {
    type: 'warning',
    content: '检测到异常登录尝试',
    time: '2小时前'
  },
  {
    type: 'order',
    content: '管理员已处理提现订单 W202403040012',
    time: '3小时前'
  },
  {
    type: 'user',
    content: '新用户注册: user2024',
    time: '5小时前'
  }
])

// 生命周期钩子
onMounted(() => {
  // 初始化图表
  initCharts()
  // 加载数据
  refreshData()
  // 添加WebSocket事件监听
  webSocketService.addEventListener(handleWebSocketEvent)
  
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  // 移除WebSocket事件监听
  webSocketService.removeEventListener(handleWebSocketEvent)
  // 移除窗口大小变化监听
  window.removeEventListener('resize', resizeCharts)
  // 销毁图表实例
  orderTrendChartInstance?.dispose()
  incomeChartInstance?.dispose()
  orderStatusChartInstance?.dispose()
})

// 监听时间范围和订单类型变化
watch([orderTrendTimeRange, incomeTimeRange, orderTypeFilter], () => {
  refreshData()
})

// WebSocket事件处理
const handleWebSocketEvent = (event: any) => {
  if ('orderNumber' in event) {
    // 如果是订单状态变更事件，自动刷新订单列表
    refreshData()
  }
}

// 初始化图表
const initCharts = () => {
  // 初始化订单趋势图
  if (orderTrendChart.value) {
    orderTrendChartInstance = echarts.init(orderTrendChart.value)
  }
  
  // 初始化收入统计图
  if (incomeChart.value) {
    incomeChartInstance = echarts.init(incomeChart.value)
  }
  
  // 初始化订单状态分布图
  if (orderStatusChart.value) {
    orderStatusChartInstance = echarts.init(orderStatusChart.value)
  }
}

// 窗口大小变化时重绘图表
const resizeCharts = () => {
  orderTrendChartInstance?.resize()
  incomeChartInstance?.resize()
  orderStatusChartInstance?.resize()
}

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 加载本地存储的统计数据(如果有)
    loadStatsFromStorage();
    
    // 更新统计数据
    // 实际项目中应该从后端API获取数据
    updateStats();
    
    // 更新图表数据
    updateCharts();
    
    // 更新待处理订单列表
    updatePendingOrders();
    
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 从本地存储加载统计数据
const loadStatsFromStorage = () => {
  try {
    // 获取本地存储的统计数据
    const storedStats = localStorage.getItem('dashboard_stats');
    if (storedStats) {
      const parsedStats = JSON.parse(storedStats);
      
      // 检查数据日期是否是今天
      if (isToday(parsedStats.date)) {
        // 如果是今天的数据，使用它
        Object.assign(stats, parsedStats.data);
        console.log('从本地存储加载今日统计数据');
      } else {
        // 如果不是今天的数据，则重置数据
        resetDailyStats();
        console.log('重置今日统计数据');
      }
    } else {
      // 如果没有存储数据，初始化
      resetDailyStats();
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    resetDailyStats();
  }
};

// 检查日期是否是今天
const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// 重置每日统计数据
const resetDailyStats = () => {
  stats.todayRechargeAmount = 0;
  stats.todayRechargeCount = 0;
  stats.todayWithdrawAmount = 0;
  stats.todayWithdrawCount = 0;
  stats.todayPendingOrderCount = 0;
  stats.todayNewUserCount = 0;
};

// 更新统计数据
const updateStats = () => {
  // 使用本地存储的订单数据计算今日统计
  updateStatsFromLocalData();
  
  // 保存统计数据到本地存储
  saveStatsToStorage();
};

// 从本地订单数据更新统计数据
const updateStatsFromLocalData = () => {
  try {
    // 获取本地存储的订单数据
    const storedOrders = localStorage.getItem('realOrders');
    if (!storedOrders) return;
    
    const orders = JSON.parse(storedOrders);
    if (!Array.isArray(orders)) return;
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0];
    
    // 过滤今日订单
    const todayOrders = orders.filter(order => order.createdAt?.includes(today));
    
    // 计算今日充值订单统计
    const todayRechargeOrders = todayOrders.filter(order => order.type === 'recharge');
    stats.todayRechargeCount = todayRechargeOrders.length;
    stats.todayRechargeAmount = todayRechargeOrders.reduce((sum, order) => 
      sum + parseFloat(order.amount || 0), 0);
    
    // 计算今日提现订单统计
    const todayWithdrawOrders = todayOrders.filter(order => order.type === 'withdraw');
    stats.todayWithdrawCount = todayWithdrawOrders.length;
    stats.todayWithdrawAmount = todayWithdrawOrders.reduce((sum, order) => 
      sum + parseFloat(order.amount || 0), 0);
    
    // 计算今日待处理订单
    const todayPendingOrders = todayOrders.filter(order => 
      order.status.includes('pending'));
    stats.todayPendingOrderCount = todayPendingOrders.length;
    
    // 更新总待处理订单数
    const allPendingOrders = orders.filter(order => 
      order.status.includes('pending'));
    stats.pendingOrderCount = allPendingOrders.length;
    
    // 为了演示，随机更新用户数据
    stats.todayNewUserCount = Math.floor(Math.random() * 5) + 1;
    
    console.log('已更新今日统计数据');
  } catch (error) {
    console.error('更新统计数据失败:', error);
    
    // 如果出错，使用随机数据（仅开发环境使用）
    stats.todayRechargeAmount = Math.random() * 2000;
    stats.todayRechargeCount = Math.floor(Math.random() * 5);
    stats.todayWithdrawAmount = Math.random() * 1500;
    stats.todayWithdrawCount = Math.floor(Math.random() * 3);
    stats.pendingOrderCount = Math.floor(Math.random() * 4);
    stats.todayPendingOrderCount = Math.floor(Math.random() * 2);
  }
};

// 保存统计数据到本地存储
const saveStatsToStorage = () => {
  try {
    // 包含今天的日期
    const statsWithDate = {
      date: new Date().toISOString().split('T')[0],
      data: { ...stats }
    };
    
    // 保存到本地存储
    localStorage.setItem('dashboard_stats', JSON.stringify(statsWithDate));
  } catch (error) {
    console.error('保存统计数据失败:', error);
  }
};

// 更新图表数据
const updateCharts = () => {
  updateOrderTrendChart()
  updateIncomeChart()
  updateOrderStatusChart()
}

// 更新订单趋势图
const updateOrderTrendChart = () => {
  if (!orderTrendChartInstance) return
  
  // 模拟生成图表数据
  const isWeek = orderTrendTimeRange.value === 'week'
  const days = isWeek ? 7 : 30
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1) + i)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  // 生成随机数据
  const rechargeData = Array.from({ length: days }, () => Math.floor(Math.random() * 30) + 10)
  const withdrawData = Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5)
  
  const option = {
    title: {
      text: isWeek ? '本周订单趋势' : '本月订单趋势',
      left: 'center',
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['充值订单', '提现订单'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '充值订单',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: rechargeData,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '提现订单',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: withdrawData,
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }
  
  orderTrendChartInstance.setOption(option)
}

// 更新收入统计图
const updateIncomeChart = () => {
  if (!incomeChartInstance) return
  
  // 模拟生成图表数据
  const isWeek = incomeTimeRange.value === 'week'
  const days = isWeek ? 7 : 30
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1) + i)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  // 生成随机数据
  const rechargeData = Array.from({ length: days }, () => Math.floor(Math.random() * 10000) + 5000)
  const withdrawData = Array.from({ length: days }, () => Math.floor(Math.random() * 8000) + 3000)
  const netIncomeData = rechargeData.map((value, index) => value - withdrawData[index])
  
  const option = {
    title: {
      text: isWeek ? '本周收入统计' : '本月收入统计',
      left: 'center',
      show: false
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].axisValueLabel + '<br/>'
        params.forEach((item: any) => {
          const color = item.color
          const marker = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`
          result += marker + item.seriesName + ': ¥' + item.value.toFixed(2) + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['充值金额', '提现金额', '净收入'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => '¥' + value.toFixed(0)
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '充值金额',
        type: 'line',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: rechargeData,
        smooth: true,
        showSymbol: false,
        itemStyle: {
          color: '#67c23a'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      },
      {
        name: '提现金额',
        type: 'line',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: withdrawData,
        smooth: true,
        showSymbol: false,
        itemStyle: {
          color: '#f56c6c'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
            ]
          }
        }
      },
      {
        name: '净收入',
        type: 'line',
        emphasis: {
          focus: 'series'
        },
        data: netIncomeData,
        smooth: true,
        showSymbol: false,
        itemStyle: {
          color: '#409eff'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  }
  
  incomeChartInstance.setOption(option)
}

// 更新订单状态分布图
const updateOrderStatusChart = () => {
  if (!orderStatusChartInstance) return
  
  // 根据订单类型筛选生成不同的图表数据
  let data: any[] = []
  if (orderTypeFilter.value === 'recharge' || orderTypeFilter.value === 'all') {
    data = data.concat([
      { value: 48, name: '充值待处理' },
      { value: 25, name: '充值处理中' },
      { value: 132, name: '充值已完成' },
      { value: 15, name: '充值失败' }
    ])
  }
  
  if (orderTypeFilter.value === 'withdraw' || orderTypeFilter.value === 'all') {
    data = data.concat([
      { value: 36, name: '提现待处理' },
      { value: 28, name: '提现处理中' },
      { value: 95, name: '提现已完成' },
      { value: 8, name: '提现失败' }
    ])
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        return `${name}: ${item?.value}`
      }
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data,
        color: [
          '#409eff', // 充值待处理
          '#67c23a', // 充值处理中
          '#1976d2', // 充值已完成
          '#f56c6c', // 充值失败
          '#e6a23c', // 提现待处理
          '#909399', // 提现处理中
          '#67c23a', // 提现已完成
          '#f56c6c'  // 提现失败
        ]
      }
    ]
  }
  
  orderStatusChartInstance.setOption(option)
}

// 更新待处理订单列表
const updatePendingOrders = () => {
  // 模拟随机生成待处理订单
  const count = Math.floor(Math.random() * 3) + 3
  pendingOrders.value = Array.from({ length: count }, (_, i) => {
    const isRecharge = Math.random() > 0.5
    const type = isRecharge ? 'recharge' : 'withdraw'
    const status = `${type}_pending`
    const time = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    
    return {
      id: i + 1,
      orderNumber: `${type.charAt(0).toUpperCase()}${new Date().getFullYear()}${String(1000 + i).padStart(4, '0')}`,
      type,
      amount: (Math.random() * 1000 + 100).toFixed(2),
      status,
      createdAt: time
    }
  })
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (date: Date) => {
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

// 获取活动类型图标
const getActivityType = (type: string) => {
  switch (type) {
    case 'order':
      return 'primary'
    case 'system':
      return 'info'
    case 'warning':
      return 'warning'
    case 'user':
      return 'success'
    default:
      return ''
  }
}

// 获取活动颜色
const getActivityColor = (type: string) => {
  switch (type) {
    case 'order':
      return '#409eff'
    case 'system':
      return '#909399'
    case 'warning':
      return '#e6a23c'
    case 'user':
      return '#67c23a'
    default:
      return '#409eff'
  }
}

// 跳转到客户管理页面
const goToCustomers = () => {
  router.push('/admin/customers')
}

// 跳转到订单管理页面
const goToOrderManagement = () => {
  router.push('/admin/orders')
}

// 处理订单
const handleOrder = (order: any) => {
  router.push('/admin/orders')
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
  display: flex;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #fff;
}

.stat-icon.recharge {
  background-color: #67c23a;
}

.stat-icon.withdraw {
  background-color: #409eff;
}

.stat-icon.user {
  background-color: #e6a23c;
}

.stat-icon.pending {
  background-color: #f56c6c;
}

.stat-content {
  flex: 1;
  padding: 15px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-count {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-count span {
  margin-right: 5px;
}

.card-action-link {
  font-size: 12px;
  margin-left: auto;
  padding: 0;
  height: auto;
}

/* 图表区域样式 */
.chart-section {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.chart-container {
  height: 300px;
  padding: 10px;
}

.chart {
  width: 100%;
  height: 100%;
}

.pie-chart {
  height: 250px;
}

.second-row {
  margin-top: 20px;
}

/* 活动时间轴样式 */
.activity-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.activity-timeline {
  height: 250px;
  overflow-y: auto;
  padding: 0 10px;
}

/* 待处理订单列表样式 */
.pending-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.pending-list {
  height: 250px;
  overflow-y: auto;
}

.order-number {
  font-family: monospace;
  color: #409eff;
}

.amount {
  font-weight: 500;
}

.time {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 15px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .second-row {
    margin-top: 0;
  }
}
</style>
