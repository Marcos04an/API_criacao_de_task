import { getMongoDb } from '../config/mongo.js';
class UserLogService {
    async createUserCreatedLog(user) {
        const db = await getMongoDb();
        await db.collection('user_creation_logs').insertOne({
            event: 'USER_CREATED',
            userId: user.id,
            email: user.email,
            name: user.name,
            age: user.age,
            createdAt: new Date()
        });
    }
}
export default new UserLogService();
