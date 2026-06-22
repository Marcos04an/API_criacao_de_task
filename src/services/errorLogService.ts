import { Request } from 'express'
import { getMongoDb } from '../config/mongo.js'
import AppError from '../errors/AppError.js'

class ErrorLogService {
    async create(error: unknown, req: Request) {
        const db = await getMongoDb()
        const statusCode = error instanceof AppError ? error.statusCode : 500
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        const stack = error instanceof Error ? error.stack : undefined
        const errorName = error instanceof Error ? error.name : 'UnknownError'

        await db.collection('error_logs').insertOne({
            name: errorName,
            message,
            statusCode,
            method: req.method,
            route: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query,
            stack,
            createdAt: new Date()
        })
    }
}

export default new ErrorLogService()
