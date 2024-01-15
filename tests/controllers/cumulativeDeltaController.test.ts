import { Request, Response } from 'express';
import { isValidTradingPair } from '../../src/utils/validateTradingPair';
import { getCumulativeDelta } from '../../src/controllers/cumulativeDeltaController';
import { KucoinService } from '../../src/services/kucoinService';
import { Trade } from '../../src/models/Trade';

describe('getCumulativeDelta Controller', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('returns an error for unsupported trading pairs', async () => {
        const mockRequest = {
            params: { pair: 'BTC-USDT' }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        await getCumulativeDelta(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Trading pair BTC-USDT is not supported' });
    });

    it('returns 200', async () => {
        // mock KucoinService
        const tradesHistory = [
            new Trade(20, 'buy', 2002, 1705264074092000000),
            new Trade(10, 'sell', 2001, 1705264074111000000)
        ];
        jest.spyOn(KucoinService.prototype, 'fetchTradeHistory').mockResolvedValue(tradesHistory);
        jest.spyOn(KucoinService.prototype, 'calculateCumulativeDelta').mockReturnValue(10);

        const mockRequest = {
            params: { pair: 'ETH-USDT' }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        await getCumulativeDelta(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({"cumulativeDelta": 10});
    });

    it('returns 500', async () => {
        // mock KucoinService
        jest.spyOn(KucoinService.prototype, 'fetchTradeHistory').mockRejectedValue(new Error('Error fetching data: 400'));
        jest.spyOn(KucoinService.prototype, 'calculateCumulativeDelta').mockReturnValue(10);

        const mockRequest = {
            params: { pair: 'ETH-USDT' }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        await getCumulativeDelta(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({'error': 'Error getting cumulative delta'});
    });
});