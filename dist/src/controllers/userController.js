import userService from '../services/userService.js';
class UserController {
    async create(req, res, next) {
        try {
            const user = await userService.create(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const users = await userService.list(req.query);
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const authenticatedUserId = req.header('x-user-id');
            const user = await userService.update(req.params.id, req.body, authenticatedUserId);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const authenticatedUserId = req.header('x-user-id');
            console.log('ID da URL no delete:', req.params.id);
            console.log('x-user-id recebido no delete:', authenticatedUserId);
            await userService.delete(req.params.id, authenticatedUserId);
            res.status(200).json({ message: 'Usuário deletado com sucesso!' });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new UserController();
