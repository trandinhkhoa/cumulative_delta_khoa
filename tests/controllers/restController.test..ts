import { Request, Response } from 'express';
import { getCumulativeDeltaLast100 } from '../../src/controllers/restController';
import { KucoinService } from '../../src/services/last100/kucoinService';
import { Trade } from '../../src/models/trade';
import { ExchangeFactory } from '../../src/controllers/restController';


describe('restControllerTest_getCumulativeDeltaLast100', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return an error for unsupported trading pairs', async () => {
        const mockRequest = {
            params: { pair: 'BTC-USDT' }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        await getCumulativeDeltaLast100(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Trading pair BTC-USDT is not supported' });
    });

    it('should returns 200', async () => {
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

        await getCumulativeDeltaLast100(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({"cumulativeDelta": 10});
    });

    it('should returns 500', async () => {
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

        await getCumulativeDeltaLast100(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({'error': 'Error getting cumulative delta'});
    });
});