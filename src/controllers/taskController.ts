import { NextFunction, Request, Response } from 'express'
import taskService from '../services/taskService.js'

class TaskController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const task = await taskService.create(req.body)
            res.status(201).json(task)
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const tasks = await taskService.list()
            res.status(200).json(tasks)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const task = await taskService.update(req.params.id as string, req.body)
            res.status(200).json(task)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await taskService.delete(req.params.id as string)
            res.status(200).json({ message: 'Tarefa deletada com sucesso!' })
        } catch (error) {
            next(error)
        }
    }
}

export default new TaskController()
