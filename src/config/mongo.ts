import { Db, MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null
let mongoConnection: Promise<MongoClient> | null = null

export async function getMongoDb(): Promise<Db> {
    if (!mongoClient) {
        const mongoUrl = process.env.MONGO_LOGS_URL ?? 'mongodb://localhost:27018/error_logs'
        mongoClient = new MongoClient(mongoUrl)
    }

    if (!mongoConnection) {
        mongoConnection = mongoClient.connect()
    }

    const client = await mongoConnection
    return client.db()
}
