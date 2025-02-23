import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from '../config/database.ts';

// 加载环境变量
dotenv.config();

// 创建Express应用（就像建立一个接待大厅）
const app = express();
const port = process.env.PORT || 3000;

// 中间件配置（就像安装大厅的基础设施）
app.use(cors());  // 允许跨域访问
app.use(express.json());  // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));  // 解析URL编码的请求体

// 基础测试路由（像设置一个简单的接待处）
app.get('/', (req, res) => {
  res.send('Welcome to ARBS8 Payment System API');
});

// 启动服务器（像正式开业）
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库结构
    await syncDatabase();
    
    // 启动服务器
    app.listen(port, () => {
      console.log(`🚀 服务器运行在: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 错误处理（像设置应急预案）
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});
