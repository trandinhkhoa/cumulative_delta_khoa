export interface Exchange {
    fetchTradeHistory(pair: string): Promise<any>;
    calculateCumulativeDelta(trades: any[]): number;
}
