import express from 'express';
import dotenv from 'dotenv';
import { Logger } from '@umkmpro/utils';

dotenv.config();
const app = express();
const logger = new Logger('Finance-Service');
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'finance-service' }));

app.listen(PORT, () => logger.info(\`Finance Service on port \${PORT}\`));
