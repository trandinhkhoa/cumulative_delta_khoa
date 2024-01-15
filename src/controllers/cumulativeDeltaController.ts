import { Request, Response } from 'express';
import { KucoinService } from '../services/kucoinService';
import { isValidTradingPair } from '../utils/validateTradingPair';
import { Exchange } from '../interfaces/exchange';
import { SUPPORTED_EXCHANGES } from '../constants/constants';
import { Trade } from '../models/Trade';

class ExchangeFactory {
    static getExchangeService(exchangeName: string): Exchange {
        switch (exchangeName) {
            case 'kucoin':
                return new KucoinService();
            // Add new cases for additional exchanges
            default:
                throw new Error('Exchange not supported');
        }
    }
}

export const getCumulativeDelta = async (req: Request, res: Response) => {
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
        console.error(error)
        res.status(500).json({error: 'Error getting cumulative delta'});
    }
};

