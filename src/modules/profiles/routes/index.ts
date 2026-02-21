// profiles/index.ts - Central routing
import express from 'express';
import adminRoutes from '../admin/route/index';
import playerRoutes from '../player/route/index';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/player', playerRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'profiles module online' });
});

export default router;
