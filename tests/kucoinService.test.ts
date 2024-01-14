// tests/kucoinService.test.ts
import { calculateCumulativeDelta, fetchTradeHistory } from '../src/services/kucoinService';

describe('calculateCumulativeDelta', () => {
    it('correctly calculates the delta', () => {
        const trades = [
            { size: '1.0', side: 'buy' },
            { size: '0.5', side: 'sell' }
        ];
        expect(calculateCumulativeDelta(trades)).toBe(0.5);
    });
});

// o mock the built-in fetch API of node
function mockFetchTimeout() {
    jest.spyOn(global, 'fetch').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout error'));
            }, 4500); // You can adjust the timeout duration as needed
        });
    });
  }

describe('fetchTradeHistory', () => {
    beforeAll(() => {
    });

    it('throws an error if the request times out', async () => {
        mockFetchTimeout(); // Call this before your tests that use fetch
        // Simulate a delayed response
        await expect(fetchTradeHistory('BTC-USDT')).rejects.toThrow('Request timed out');
    });
});