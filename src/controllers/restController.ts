import { Request, Response } from 'express';
import { KucoinService } from '../services/last100/kucoinService';
import { isValidTradingPair } from '../utils/validateTradingPair';
import { ExchangeInterface, ExchangeWebSocketServiceInterface } from '../services/exchangeInterfaces';
import { SUPPORTED_EXCHANGES } from '../utils/constants/constants';
import { Trade } from '../models/trade';

export class ExchangeFactory {
    static getExchangeService(exchangeName: string): ExchangeInterface {
        switch (exchangeName) {
            case 'kucoin':
                return new KucoinService();
            // Add new cases for additional exchanges
            default:
                throw new Error('Exchange not supported');
        }
    }
}

export const getCumulativeDeltaLast100 = async (req: Request, res: Response) => {
    const tradingPair = req.params.pair;

    if (!isValidTradingPair(tradingPair)) {
        return res.status(400).json({ error: `Trading pair ${tradingPair} is not supported` });
    }

    try {
        let cumulativeDeltaAcrossAllExchange = 0
        for (const exchange of SUPPORTED_EXCHANGES) {
            const exchangeService = ExchangeFactory.getExchangeService(exchange);
            const trades: Trade[] = await exchangeService.fetchTradeHistory(tradingPair);
            cumulativeDeltaAcrossAllExchange += exchangeService.calculateCumulativeDelta(trades);
        }
        res.status(200).json({ cumulativeDelta: cumulativeDeltaAcrossAllExchange });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error getting cumulative delta: ', error.message);
            console.error('Stack trace:', error.stack);
        } else {
            console.error('An unexpected error occurred:', error);
        }
        res.status(500).json({error: 'Error getting cumulative delta'});
    }
};


export const getCumulativeDeltaSinceStart = (exchanges: ExchangeWebSocketServiceInterface[]) => async (req: Request, res: Response) => {
    const tradingPair = req.params.pair;
    if (!isValidTradingPair(tradingPair)) {
        return res.status(400).json({ error: `Trading pair ${tradingPair} is not supported` });
    }

    let cumulativeDelta = 0
    for (let exchange of exchanges ) {
        cumulativeDelta += exchange.getCumulativeDelta(tradingPair);
    }
    res.status(200).json({ cumulativeDelta: cumulativeDelta });
};

