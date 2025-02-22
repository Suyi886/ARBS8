import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量（像读取房子的设计图）
dotenv.config();

// 创建Sequelize实例（像建立房子的框架）
const sequelize = new Sequelize(
  process.env.DB_NAME as string,    // 数据库名称
  process.env.DB_USER as string,    // 用户名
  process.env.DB_PASS as string,    // 密码
  {
    host: process.env.DB_HOST || 'localhost', // 主机地址
    port: parseInt(process.env.DB_PORT as string, 10) || 3306, // 端口
    dialect: 'mysql',               // 使用MySQL
    pool: {                        // 连接池配置（像管理房子的访客容量）
      max: 5,                      // 最大连接数
      min: 0,                      // 最小连接数
      acquire: 30000,              // 获取连接最大等待时间
      idle: 10000                  // 空闲连接保留时间
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// 测试数据库连接的函数（像测试房子的设施）
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// 数据库同步函数（像装修房子）
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ 
      force: false,  // false表示不会删除现有表
      alter: true    // true表示会更新表结构
    });
    console.log('✅ 数据库同步完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    return false;
  }
};

export default sequelize;
