import { Trade } from '../models/Trade';

export interface Exchange {
    fetchTradeHistory(pair: string): Promise<Trade[]>;
    calculateCumulativeDelta(trades: Trade[]): number;
}
