import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from '../config/database';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes'; // 导入新路由

// 加载环境变量（像查看建筑规划）
dotenv.config();

// 创建Express应用（像打地基）
const app = express();
const port = process.env.PORT || 3000;

// 配置中间件（像安装基础设施）
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由（像设置门厅）
app.get('/', (req, res) => {
    res.send('Welcome to ARBS8 Payment System API');
});

// 注册用户路由（像规划房间）
app.use('/api/users', userRoutes);

// 注册订单路由（新添加的路由）
app.use('/api/orders', orderRoutes);

// 错误处理中间件（像安装安全系统）
app.use((err: any, req: any, res: any, next: any) => {
    console.error('错误:', err.stack);
    res.status(500).json({
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 启动服务器函数（像正式启用房子）
const startServer = async () => {
    try {
        // 测试数据库连接
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('数据库连接失败');
        }
        
        // 同步数据库结构
        const isSynced = await syncDatabase();
        if (!isSynced) {
            throw new Error('数据库同步失败');
        }
        
        // 启动服务器
        app.listen(port, () => {
            console.log(`✅ 服务器运行在: http://localhost:${port}`);
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
};

// 启动服务器
startServer();

// 优雅退出处理（像安全关闭房子）
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在优雅退出...');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('未处理的Promise拒绝:', error);
});

export default app;
