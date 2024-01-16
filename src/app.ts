import express from 'express'
import { Router } from 'express';
import { getCumulativeDelta } from './controllers/cumulativeDeltaController';
import { KucoinWebSocketService } from './services/kucoinWebSocketService';

const kucoinWebSocketService = new KucoinWebSocketService();
kucoinWebSocketService.connect();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('Server is up and running!');
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

const router = Router();

router.get('/cumulative-delta/:pair', getCumulativeDelta)

router.get('/cumulative-delta-real/:pair', (req,res) => {
    res.status(200).json({ cumulativeDelta: kucoinWebSocketService.getCumulativeDelta() });
})

app.use('/api', router)

export default app;

