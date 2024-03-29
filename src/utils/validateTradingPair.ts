import { SUPPORTED_TRADING_PAIRS } from './constants/constants';

export const isValidTradingPair = (pair: string): boolean => {
    return SUPPORTED_TRADING_PAIRS.has(pair);
};
