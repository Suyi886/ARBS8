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
  password: 'your-password', // 替换为你的MySQL密码
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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 使用提交的角色，将'client'映射到'user'，保持'admin'不变
    const userRole = role === 'client' ? 'user' : role === 'admin' ? 'admin' : 'user';
    
    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, userRole]
    );
    
    res.status(201).json({
      message: '用户创建成功',
      userId: result.insertId
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有用户（仅管理员）
app.get('/api/users', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, role, status, balance, created_at as createdAt, updated_at as updatedAt FROM users'
    );
    
    res.json({ users });
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
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: '无效的用户数据' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      details: []
    };
    
    // 处理每个用户
    for (const user of users) {
      try {
        // 检查用户名是否已存在
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE username = ?',
          [user.username]
        );
        
        if (existingUsers.length > 0) {
          results.failed++;
          results.details.push({
            username: user.username,
            status: 'failed',
            reason: '用户名已存在'
          });
          continue;
        }
        
        // 哈希密码
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // 插入用户
        await pool.query(
          'INSERT INTO users (username, password, role, status, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [
            user.username,
            hashedPassword,
            user.role || 'client',
            user.status || 'active',
            user.balance || 0,
            new Date(user.createdAt || Date.now())
          ]
        );
        
        results.success++;
        results.details.push({
          username: user.username,
          status: 'success'
        });
      } catch (error) {
        console.error(`迁移用户 ${user.username} 错误:`, error);
        results.failed++;
        results.details.push({
          username: user.username,
          status: 'failed',
          reason: '内部错误'
        });
      }
    }
    
    res.json({
      message: '用户迁移完成',
      results
    });
  } catch (error) {
    console.error('迁移用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 