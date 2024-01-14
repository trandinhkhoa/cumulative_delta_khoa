import { Request, Response } from 'express';
import { fetchTradeHistory, calculateCumulativeDelta } from '../services/kucoinService';

// This function will handle the logic for calculating cumulative delta
export const getCumulativeDelta = async (req: Request, res: Response) => {
    const tradingPair = req.params.pair;
    try {
        const tradeHistoryResponse = await fetchTradeHistory(tradingPair);
        const delta = calculateCumulativeDelta(tradeHistoryResponse.data);
        res.status(200).json({ cumulativeDelta: delta });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data: ' + error });
    }
};

