import AppError from '../errors/AppError.js';
import errorLogService from '../services/errorLogService.js';
export default async function errorHandler(error, req, res, next) {
    try {
        await errorLogService.create(error, req);
    }
    catch (logError) {
        console.error('Erro ao salvar log no MongoDB:', logError);
    }
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
}
