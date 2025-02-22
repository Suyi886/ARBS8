import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // 加载 .env 文件中的配置

const sequelize = new Sequelize(
  process.env.DB_NAME as string, // 数据库名称
  process.env.DB_USER as string, // 数据库用户名
  process.env.DB_PASS as string, // 数据库密码
  {
    host: process.env.DB_HOST || 'localhost', // 数据库主机地址
    port: parseInt(process.env.DB_PORT as string, 10) || 3306, // 数据库端口
    dialect: 'mysql', // 使用 MySQL 数据库
    logging: false, // 是否打印 SQL 日志，开发时可以打开
  }
);

// 测试数据库连接的函数
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

// 数据库同步函数
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ 数据库同步完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    return false;
  }
};

export default sequelize;
