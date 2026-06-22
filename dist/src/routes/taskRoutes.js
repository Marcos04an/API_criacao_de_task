import { Router } from 'express';
import taskController from '../controllers/taskController.js';
const router = Router();
router.post('/tasks', taskController.create);
router.get('/tasks', taskController.list);
router.put('/tasks/:id', taskController.update);
router.delete('/tasks/:id', taskController.delete);
export default router;
