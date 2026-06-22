import { NextFunction, Request, Response } from 'express'
import userService from '../services/userService.js'


class UserController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.create(req.body)
            res.status(201).json(user)
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.list(req.query as any)
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const authenticatedUserId = req.header('x-user-id')
            const user = await userService.update(
                req.params.id as string,
                req.body,
                authenticatedUserId
            )
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const authenticatedUserId = req.header('x-user-id')
            console.log('ID da URL no delete:', req.params.id)
            console.log('x-user-id recebido no delete:', authenticatedUserId)
            await userService.delete(req.params.id as string, authenticatedUserId)
            res.status(200).json({ message: 'Usuário deletado com sucesso!' })
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController() 
