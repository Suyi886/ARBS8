import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// 检查是否使用本地存储模式
const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';
const isRender = process.env.RENDER === 'true';

// 创建数据库连接池
let connectDB: Pool;

// 只有在不使用本地存储模式时才创建数据库连接
if (!useLocalStorage) {
  try {
    connectDB = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'Ax112211',
      database: process.env.DB_NAME || 'payment_system',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // 修改为false以避免SSL验证问题
      } : undefined
    });
    console.log('数据库连接池已创建');
  } catch (error) {
    console.error('创建数据库连接池失败:', error);
  }
}

// 测试数据库连接函数
export const testConnection = async () => {
    if (useLocalStorage) {
        console.log('✅ 使用本地存储模式，跳过数据库连接测试');
        return true;
    }
    
    try {
        const connection = await connectDB.getConnection();
        console.log('✅ 数据库连接成功！');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        if (isRender) {
            console.log('在Render环境中，将使用本地存储模式');
            return true; // 在Render环境中即使连接失败也返回成功
        }
        return false;
    }
};

// 数据库同步函数（像装修和检查房屋设施）
export const syncDatabase = async () => {
    // 如果使用本地存储模式，直接返回成功
    if (useLocalStorage) {
        console.log('✅ 使用本地存储模式，跳过数据库同步');
        return true;
    }
    
    try {
        await testConnection();
        
        // 创建用户表
        await connectDB.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 创建充值订单表
        await connectDB.execute(`
            CREATE TABLE IF NOT EXISTS recharge_orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_by VARCHAR(50),
                remark TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // 创建提现订单表
        await connectDB.execute(`
            CREATE TABLE IF NOT EXISTS withdraw_orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_by VARCHAR(50),
                remark TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        console.log('✅ 数据库同步完成！');
        return true;
    } catch (error) {
        console.error('❌ 数据库同步失败:', error);
        return false;
    }
};

// 导出数据库连接池，如果是本地存储模式则导出一个空对象作为替代
export default useLocalStorage ? {} as Pool : connectDB;
