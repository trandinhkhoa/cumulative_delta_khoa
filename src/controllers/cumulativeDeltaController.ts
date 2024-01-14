import { Request, Response } from 'express';
import { fetchTradeHistory, calculateCumulativeDelta } from '../services/kucoinService';
import { isValidTradingPair } from '../utils/validateTradingPair';

export const getCumulativeDelta = async (req: Request, res: Response) => {
    const tradingPair = req.params.pair;

    if (!isValidTradingPair(tradingPair)) {
        return res.status(400).json({ error: `Trading pair ${tradingPair} is not supported` });
    }

    try {
        const tradeHistoryResponse = await fetchTradeHistory(tradingPair);
        const delta = calculateCumulativeDelta(tradeHistoryResponse.data);
        res.status(200).json({ cumulativeDelta: delta });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data: ' + error });
    }
};

