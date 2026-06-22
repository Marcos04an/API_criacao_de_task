import taskService from '../services/taskService.js';
class TaskController {
    async create(req, res, next) {
        try {
            const task = await taskService.create(req.body);
            res.status(201).json(task);
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const tasks = await taskService.list();
            res.status(200).json(tasks);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const task = await taskService.update(req.params.id, req.body);
            res.status(200).json(task);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await taskService.delete(req.params.id);
            res.status(200).json({ message: 'Tarefa deletada com sucesso!' });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new TaskController();
