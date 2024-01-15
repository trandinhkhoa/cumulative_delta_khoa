import { Trade } from '../models/trade';

export interface Exchange {
    fetchTradeHistory(pair: string): Promise<Trade[]>;
    calculateCumulativeDelta(trades: Trade[]): number;
}
