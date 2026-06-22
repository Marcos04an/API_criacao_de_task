import { Router } from 'express';
import userController from '../controllers/userController.js';
const router = Router();
router.post('/usuarios', userController.create);
router.get('/usuarios', userController.list);
router.put('/usuarios/:id', userController.update);
router.delete('/usuarios/:id', userController.delete);
export default router;
