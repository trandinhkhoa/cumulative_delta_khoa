import { SUPPORTED_TRADING_PAIRS } from '../constants/tradingPairs';

export const isValidTradingPair = (pair: string): boolean => {
    return SUPPORTED_TRADING_PAIRS.has(pair);
};
