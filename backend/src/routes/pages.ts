import { Router } from 'express';
import * as pageController from '../controllers/pageController';

const router = Router();

router.get('/', pageController.getPages);
router.post('/', pageController.createPage);
router.get('/:id', pageController.getPageById);
router.put('/:id', pageController.updatePage);
router.delete('/:id', pageController.deletePage);

export default router;
