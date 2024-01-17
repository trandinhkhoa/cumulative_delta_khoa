import express from 'express'
import { Router } from 'express';
import { getCumulativeDeltaLast100, getCumulativeDeltaSinceStart } from './controllers/restController';
import { KucoinWebSocketService } from './services/sinceStart/kucoinWebSocketService';
import { KucoinWebSocketGateway } from './gateways/kucoinWebSocketGateway';
import { ExchangeWebSocketServiceInterface } from './services/exchangeInterfaces';

let exchangeWebSocketServices : ExchangeWebSocketServiceInterface[] = []
let kucoinWebSocketService = new KucoinWebSocketService
const kucoinWebSocketGateway = new KucoinWebSocketGateway(kucoinWebSocketService);
kucoinWebSocketGateway.connect();
exchangeWebSocketServices.push(kucoinWebSocketService)

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

router.get('/cumulative-delta-last-100/:pair', getCumulativeDeltaLast100)

router.get('/cumulative-delta-since-start/:pair', getCumulativeDeltaSinceStart(exchangeWebSocketServices))

app.use('/api', router)

export default app;

