import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量（像读取建房配置）
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// 创建数据库连接池（就像建立一个物业服务中心）
export const connectDB: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',      // 数据库服务器地址
    user: process.env.DB_USER || 'root',          // 数据库用户名
    password: process.env.DB_PASS || 'Ax112211',          // 数据库密码
    database: process.env.DB_NAME || 'payment_system', // 数据库名称
    port: parseInt(process.env.DB_PORT || '3306', 10), // 数据库端口
    waitForConnections: true,    // 是否等待连接
    connectionLimit: 10,         // 最大连接数
    queueLimit: 0               // 队列限制（0表示不限制）
});

// 测试数据库连接函数（像检查物业服务中心是否正常运作）
export const testConnection = async () => {
    try {
        const connection = await connectDB.getConnection();
        console.log('✅ 数据库连接成功！');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        return false;
    }
};

// 数据库同步函数（像装修和检查房屋设施）
export const syncDatabase = async () => {
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

export default connectDB;
