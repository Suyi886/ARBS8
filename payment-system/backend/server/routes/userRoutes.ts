// 导入必要的模块 (就像准备建房子需要的各种工具和材料)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './server/routes/userRoutes';
import { connectDB } from './config/database';

// 加载环境变量 (就像查看建房设计图纸)
dotenv.config();

// 创建 Express 应用实例 (相当于打地基)
const app = express();

// 定义端口 (就像确定房子的地址)
const PORT = process.env.PORT || 3000;

// 中间件配置 (就像房子的基础设施)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // 前端地址
  credentials: true // 允许携带认证信息
}));

// 解析请求体 (就像安装管道系统)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 基础路由 (就像房子的门厅)
app.get('/', (req, res) => {
  res.json({ message: '支付系统API服务正在运行' });
});

// 路由配置 (就像房子的不同房间)
app.use('/api/users', userRoutes);

// 错误处理中间件 (就像房子的安全系统)
app.use((err: any, req: any, res: any, next: any) => {
  console.error('错误:', err.stack);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 处理未找到的路由 (就像处理走错房间的情况)
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 启动服务器 (就像正式开始使用这座房子)
const startServer = async () => {
  try {
    // 连接数据库 (就像接通水电)
    await connectDB();
    console.log('数据库连接成功');

    // 启动服务器监听 (就像打开房子的大门)
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log('环境:', process.env.NODE_ENV || 'development');
    });

  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动应用 (开始使用这座房子)
startServer();

// 优雅退出处理 (就像安全关闭房子)
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，优雅退出...');
  process.exit(0);
});

export default app;
