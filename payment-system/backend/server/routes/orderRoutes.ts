import { Router } from 'express';
import { connectDB } from '../../config/database';

const router = Router();

// 创建订单
router.post('/orders', async (req, res) => {
  const { user_id, amount } = req.body;
  try {
    await connectDB.execute(
      'INSERT INTO orders (user_id, amount, status, created_at) VALUES (?, ?, "pending", NOW())',
      [user_id, amount]
    );
    res.status(201).json({ success: true, message: '订单创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建订单失败', error });
  }
});

// 查询订单
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await connectDB.execute('SELECT * FROM orders');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取订单失败', error });
  }
});

// 更新订单状态
router.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await connectDB.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    res.status(200).json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新订单状态失败', error });
  }
});

export default router;