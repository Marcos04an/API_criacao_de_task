import { MongoClient } from 'mongodb';
let mongoClient = null;
let mongoConnection = null;
export async function getMongoDb() {
    if (!mongoClient) {
        const mongoUrl = process.env.MONGO_LOGS_URL ?? 'mongodb://localhost:27018/error_logs';
        mongoClient = new MongoClient(mongoUrl);
    }
    if (!mongoConnection) {
        mongoConnection = mongoClient.connect();
    }
    const client = await mongoConnection;
    return client.db();
}
