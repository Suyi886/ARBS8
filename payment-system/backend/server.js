const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // 在生产环境中应使用环境变量

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 创建MySQL连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Ax112211', // 替换为你的MySQL密码
  database: 'payment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 验证令牌中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: '未提供令牌' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '令牌无效或已过期' });
    req.user = user;
    next();
  });
};

// 检查管理员权限中间件
const checkAdmin = (req, res, next) => {
  console.log('检查管理员权限:', req.user);
  if (req.user.role !== 'admin') {
    console.log('拒绝访问: 用户不是管理员');
    return res.status(403).json({ message: '需要管理员权限' });
  }
  console.log('授权管理员访问');
  next();
};

// 在API定义之前添加数据库验证
// 验证数据库连接和表结构
const validateDatabase = async () => {
  console.log('开始验证数据库连接和结构...');
  
  try {
    // 测试数据库连接
    const connection = await pool.getConnection();
    console.log('✅ MySQL数据库连接成功');
    connection.release();
    
    // 检查users表是否存在
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('users表不存在，正在创建...');
      
      // 创建users表
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
          status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
          balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('✅ users表创建成功');
    } else {
      console.log('✅ users表已存在');
      
      // 检查表结构，确保role字段正确
      try {
        const [columns] = await connection.query("SHOW COLUMNS FROM users WHERE Field = 'role'");
        if (columns.length === 0) {
          console.log('缺少role字段，正在添加...');
          await connection.query("ALTER TABLE users ADD role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER password");
          console.log('✅ role字段添加成功');
        } else {
          console.log('✅ role字段已存在:', columns[0].Type);
          // 如果role字段类型不正确，修改它
          if (!columns[0].Type.includes("enum('user','admin')")) {
            console.log('role字段类型不正确，正在修改...');
            await connection.query("ALTER TABLE users MODIFY role ENUM('user', 'admin') NOT NULL DEFAULT 'user'");
            console.log('✅ role字段类型修改成功');
          }
        }
      } catch (tableError) {
        console.error('检查表结构时出错:', tableError);
      }
    }
    
    // 检查是否有管理员用户
    const [admins] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    
    console.log(`现有管理员用户: ${admins[0].count}个`);
    
    return true;
  } catch (error) {
    console.error('数据库验证失败:', error);
    return false;
  }
};

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    console.log('--------- 开始处理注册请求 ---------');
    const { username, password, role } = req.body;
    
    console.log('收到注册请求:', { 
      username, 
      passwordLength: password ? password.length : 0,
      role,
      bodyType: typeof req.body,
      body: JSON.stringify(req.body)
    });
    
    // 验证输入
    if (!username || !password) {
      console.log('❌ 注册失败: 用户名或密码为空');
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 检查用户名是否已存在
    try {
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (existingUsers.length > 0) {
        console.log('❌ 注册失败: 用户名已存在');
        return res.status(409).json({ message: '用户名已存在' });
      }
    } catch (checkError) {
      console.error('❌ 检查用户名时出错:', checkError);
      return res.status(500).json({ message: '检查用户名时出错', error: checkError.message });
    }
    
    // 哈希密码
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('❌ 密码哈希失败:', hashError);
      return res.status(500).json({ message: '密码处理失败', error: hashError.message });
    }
    
    // 验证角色值是否有效（必须是'user'或'admin'）
    const validRoles = ['user', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';
    
    console.log('即将创建用户，角色:', userRole);
    
    // 创建用户
    try {
      const [result] = await pool.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, userRole]
      );
      
      console.log('✅ 用户创建成功:', { id: result.insertId, username, role: userRole });
      
      return res.status(201).json({
        message: '用户创建成功',
        userId: result.insertId
      });
    } catch (dbError) {
      console.error('❌ 数据库插入错误:', dbError);
      return res.status(500).json({ 
        message: '创建用户失败: ' + dbError.message, 
        error: dbError.message,
        code: dbError.code 
      });
    }
  } catch (error) {
    console.error('❌ 注册过程中发生未预期错误:', error);
    return res.status(500).json({ message: '服务器错误: ' + error.message, error: error.message });
  } finally {
    console.log('--------- 注册请求处理完成 ---------');
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('收到登录请求:', { username }); // 不记录密码
    
    // 验证输入
    if (!username || !password) {
      console.log('登录失败: 用户名或密码为空');
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      console.log('登录失败: 用户不存在');
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = users[0];
    console.log('找到用户:', { id: user.id, username: user.username, role: user.role });
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('登录失败: 密码不匹配');
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 创建JWT令牌
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log('登录成功:', { id: user.id, username: user.username, role: user.role });
    
    // 返回用户信息和令牌
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有用户（管理员）
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    console.log('获取所有用户请求');
    
    // 查询所有用户，但排除当前用户（防止管理员删除自己）
    const [users] = await pool.query(
      'SELECT id, username, role, status, balance, created_at FROM users WHERE id != ?',
      [req.user.id]
    );
    
    console.log(`查询到 ${users.length} 个用户`);
    
    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      balance: parseFloat(user.balance || 0),
      createdAt: user.created_at
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个用户
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 验证权限（只有管理员或用户本人可以查看）
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: '没有权限查看此用户信息' });
    }
    
    const [users] = await pool.query(
      'SELECT id, username, role, status, balance, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户状态（仅管理员）
app.patch('/api/users/:id/status', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: '状态无效' });
    }
    
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户状态已更新' });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户余额
app.patch('/api/users/:id/balance', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { balance } = req.body;
    
    if (isNaN(balance)) {
      return res.status(400).json({ message: '余额必须是有效数字' });
    }
    
    const [result] = await pool.query(
      'UPDATE users SET balance = ? WHERE id = ?',
      [balance, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户余额已更新' });
  } catch (error) {
    console.error('更新用户余额错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户（仅管理员）
app.delete('/api/users/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 迁移localStorage用户到MySQL
app.post('/api/migrate-users', async (req, res) => {
  try {
    console.log('------- 开始用户迁移 -------');
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      console.log('无效的用户数据:', req.body);
      return res.status(400).json({ message: '无效的用户数据' });
    }
    
    console.log(`准备迁移 ${users.length} 个用户`);
    
    const results = {
      success: 0,
      failed: 0,
      details: []
    };
    
    // 处理每个用户
    for (const user of users) {
      try {
        console.log(`开始处理用户: ${user.username}, 角色: ${user.role}`);
        
        // 检查用户名是否已存在
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE username = ?',
          [user.username]
        );
        
        if (existingUsers.length > 0) {
          console.log(`用户 ${user.username} 已存在，跳过`);
          results.failed++;
          results.details.push({
            username: user.username,
            status: 'failed',
            reason: '用户名已存在'
          });
          continue;
        }
        
        // 确保角色值是有效的
        let userRole = 'user';
        if (user.role === 'admin') {
          userRole = 'admin';
        }
        
        console.log(`用户 ${user.username} 的角色将设置为: ${userRole}`);
        
        // 哈希密码
        const hashedPassword = await bcrypt.hash(user.password || '123456', 10);
        
        // 转换其他字段
        const status = 'active';
        const balance = user.balance || 0;
        const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
        
        console.log(`插入用户 ${user.username} 的数据:`, { 
          role: userRole, 
          status, 
          balance, 
          createdAt: createdAt.toISOString() 
        });
        
        // 插入用户
        try {
          const [result] = await pool.query(
            'INSERT INTO users (username, password, role, status, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [
              user.username,
              hashedPassword,
              userRole,
              status,
              balance,
              createdAt
            ]
          );
          
          console.log(`用户 ${user.username} 迁移成功，ID: ${result.insertId}`);
          results.success++;
          results.details.push({
            username: user.username,
            status: 'success'
          });
        } catch (insertError) {
          console.error(`插入用户 ${user.username} 到数据库失败:`, insertError);
          results.failed++;
          results.details.push({
            username: user.username,
            status: 'failed',
            reason: `数据库错误: ${insertError.message}`
          });
        }
      } catch (userError) {
        console.error(`处理用户 ${user.username} 过程中出错:`, userError);
        results.failed++;
        results.details.push({
          username: user.username,
          status: 'failed',
          reason: `处理错误: ${userError.message}`
        });
      }
    }
    
    console.log('------- 迁移完成 -------');
    console.log(`总结: 成功 ${results.success} 个, 失败 ${results.failed} 个`);
    
    res.json({
      message: '用户迁移完成',
      results
    });
  } catch (error) {
    console.error('整体迁移过程错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 在启动服务器之前验证数据库
validateDatabase().then(success => {
  if (success) {
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } else {
    console.error('由于数据库验证失败，服务器未启动');
    process.exit(1);
  }
}); 