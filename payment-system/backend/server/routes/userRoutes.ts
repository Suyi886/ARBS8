// server/routes/userRoutes.ts

import { Router, Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { connectDB } from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// 定义接口（像设计表格模板）
interface RegisterRequest {
    username: string;
    password: string;
}

interface LoginRequest {
    username: string;
    password: string;
}

// 定义用户接口，继承 RowDataPacket（像设计标准居民信息表）
interface User extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    created_at: Date;
}

// 用户注册路由（像办理入住手续）
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
        const { username, password } = req.body;

        // 1. 检查用户名是否存在（像检查房间是否已被占用）
        const [existingUsers] = await connectDB.execute<User[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 2. 密码加密（像安装安全门锁）
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. 保存到数据库（像登记新住户信息）
        await connectDB.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: '用户注册成功'
        });

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '注册失败',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// 用户登录路由（像验证住户身份）
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
        const { username, password } = req.body;

        // 1. 查询用户（像查找住户记录）
        const [users] = await connectDB.execute<User[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 2. 验证密码（像验证门禁卡）
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 3. 生成JWT令牌（像发放电子门禁卡）
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: '登录成功',
            token
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(401).json({
            success: false,
            message: '登录失败',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

export default router;
