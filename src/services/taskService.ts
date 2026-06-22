import { Prisma } from '@prisma/client'
import prisma from '../config/prisma.js'
import AppError from '../errors/AppError.js'

interface TaskData {
    title?: string;
    description?: string;
    completed?: boolean;
    userId?: string;
}

class TaskService {
    private async validateUserExists(userId?: string) {
        if (!userId) {
            throw new AppError('ID do usuário é obrigatório')
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new AppError('Usuário relacionado não encontrado', 404)
        }
    }

    async create(taskData: TaskData) {
        if (!taskData.title || !taskData.userId) {
            throw new AppError('Título e ID do usuário são obrigatórios')
        }

        await this.validateUserExists(taskData.userId)

        try {
            return await prisma.task.create({
                data: {
                    title: taskData.title,
                    description: taskData.description,
                    completed: taskData.completed,
                    userId: taskData.userId
                }
            })
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new AppError('Tarefa já cadastrada', 409)
            }

            throw error
        }
    }

    async list() {
        return await prisma.task.findMany({
            //task que inclui o usuario que possui o id que foi buscado
            include: {
                user: true
            },
            orderBy: {
                title: 'asc'
            }
        })
    }

    async update(id: string, taskData: TaskData) {
        if (!id) {
            throw new AppError('ID da tarefa é obrigatório')
        }

        if (taskData.userId) {
            await this.validateUserExists(taskData.userId)
        }

        try {
            return await prisma.task.update({
                where: { id },
                data: {
                    title: taskData.title,
                    description: taskData.description,
                    completed: taskData.completed,
                    userId: taskData.userId
                }
            })
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new AppError('Tarefa não encontrada', 404)
            }

            throw error
        }
    }

    async delete(id: string) {
        if (!id) {
            throw new AppError('ID da tarefa é obrigatório')
        }

        try {
            return await prisma.task.delete({
                where: { id }
            })
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new AppError('Tarefa não encontrada', 404)
            }

            throw error
        }
    }
}

export default new TaskService()
