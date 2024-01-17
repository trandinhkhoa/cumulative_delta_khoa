import { RawData } from 'ws';
import { Trade } from '../models/trade';

// for getting a batch of trades and returning cumulative delta for that batch
export interface ExchangeInterface {
    fetchTradeHistory(pair: string): Promise<Trade[]>;
    calculateCumulativeDelta(trades: Trade[]): number;
}

// for getting real time trades data and returning cumulative delta since application start up
export interface ExchangeWebSocketServiceInterface {
    handleMessage(data: RawData): void;
    handleError(error: Error): void;
    handleClose(): void;
    getCumulativeDelta(tradingPair: String): number;
}
