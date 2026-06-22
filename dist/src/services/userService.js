import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import AppError from '../errors/AppError.js';
class UserService {
    validateUserOwnership(id, authenticatedUserId) {
        if (!authenticatedUserId) {
            throw new AppError('Usuário autenticado não informado', 401);
        }
        if (authenticatedUserId !== id) {
            throw new AppError('Você só pode alterar ou deletar a sua própria conta', 403);
        }
    }
    async create(userData) {
        if (!userData.email || !userData.name || !userData.age) {
            throw new AppError('E-mail, nome e idade são obrigatórios');
        }
        try {
            return await prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    age: userData.age
                }
            });
        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new AppError('E-mail já cadastrado', 409);
            }
            throw error;
        }
    }
    async list(filters) {
        if (Object.keys(filters).length > 0) {
            return await prisma.user.findMany({
                where: {
                    name: filters.name,
                    email: filters.email,
                    age: filters.age
                }
            });
        }
        return await prisma.user.findMany();
    }
    async update(id, userData, authenticatedUserId) {
        if (!id) {
            throw new AppError('ID do usuário é obrigatório');
        }
        this.validateUserOwnership(id, authenticatedUserId);
        if (!userData.email || !userData.name || !userData.age) {
            throw new AppError('E-mail, nome e idade são obrigatórios');
        }
        try {
            return await prisma.user.update({
                where: { id },
                data: {
                    email: userData.email,
                    name: userData.name,
                    age: userData.age
                }
            });
        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new AppError('E-mail já cadastrado', 409);
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new AppError('Usuário não encontrado', 404);
            }
            throw error;
        }
    }
    async delete(id, authenticatedUserId) {
        if (!id) {
            throw new AppError('ID do usuário é obrigatório');
        }
        this.validateUserOwnership(id, authenticatedUserId);
        const tasks = await prisma.$queryRaw `
            SELECT COUNT(*)::int AS count
            FROM "Task"
            WHERE "userId" = ${id}
        `;
        if (tasks[0]?.count > 0) {
            throw new AppError('Não é possível deletar usuário com tarefas vinculadas', 409);
        }
        try {
            return await prisma.user.delete({
                where: { id }
            });
        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new AppError('Usuário não encontrado', 404);
            }
            throw error;
        }
    }
}
export default new UserService();
