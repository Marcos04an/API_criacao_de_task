import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import errorHandler from './src/middlewares/errorHandler.js';
import swaggerDocument from './src/config/swagger.js';
import taskRoutes from './src/routes/taskRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(userRoutes);
app.use(taskRoutes);
app.use(errorHandler);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
});
