import { Request, Response } from 'express';
import { isValidTradingPair } from '../../src/utils/validateTradingPair';
import { getCumulativeDelta } from '../../src/controllers/cumulativeDeltaController';

describe('getCumulativeDelta Controller', () => {
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
});
