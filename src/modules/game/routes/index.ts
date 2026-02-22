// game/routes/index.ts - Central routing hub for game module
import express from 'express';
import characterRoutes from '../characters/routes/index';
import campaignRoutes from '../campaigns/routes/index';

const router = express.Router();

// Mount game subdomains
router.use('/characters', characterRoutes);
router.use('/campaigns', campaignRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'game module online' });
});

export default router;
