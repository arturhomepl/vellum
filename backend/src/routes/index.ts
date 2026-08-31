import { Router } from 'express';
import pagesRouter from './pages';

const router = Router();
router.get('/health', (req, res) => res.send({ status: 'ok' }));
router.use('/pages', pagesRouter);

export default router;