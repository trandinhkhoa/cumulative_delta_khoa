// import { KucoinService, calculateCumulativeDelta, fetchTradeHistory } from '../../src/services/kucoinService';

import { Trade } from "../../src/models/Trade";
import { KucoinService } from "../../src/services/kucoinService";

describe('calculateCumulativeDelta', () => {
    let kucoinService: KucoinService
    beforeAll(() => {
        kucoinService = new KucoinService();
    })
    it('correctly calculates the delta', () => {
        const trades = [
            { size: 2, side: 'buy' },
            { size: 5, side: 'sell' },
            { size: 7, side: 'buy' }
        ] as unknown as Trade[];
        expect(kucoinService.calculateCumulativeDelta(trades)).toBe(4);
    });
});

// mock the built-in fetch API of node
function mockFetchTimeout() {
    jest.spyOn(global, 'fetch').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout error'));
            }, 4500);
        });
    });
}

// mock the built-in fetch API of node
function mockFetchOk(jsonResponseBody: any) {
    jest.spyOn(global, 'fetch').mockImplementation(() => {
        return new Promise((resolve, reject) => {
            const exchangeResponse = new Response(JSON.stringify(jsonResponseBody), {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
            });

            resolve(exchangeResponse)
        })
    });
}

describe('fetchTradeHistory', () => {
    let kucoinService: KucoinService
    beforeAll(() => {
        kucoinService = new KucoinService();
    })

    // Cleanup the mock after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('throws an error if the request times out', async () => {
        mockFetchTimeout(); // Call this before your tests that use fetch
        // Simulate a delayed response
        await expect(kucoinService.fetchTradeHistory('ETH-USDT')).rejects.toThrow('Request timed out');
    });

    it('returns a successful response', async () => {
        const jsonResponseBody = {
            code: '200000',
            data: [
                {
                    sequence: '123',
                    price: '2002',
                    size: '1',
                    side: 'buy',
                    time: 1705264074092000000,
                },
                {
                    sequence: '456',
                    price: '2001',
                    size: '2',
                    side: 'sell',
                    time: 1705264074111000000,
                },
            ],
        };

        mockFetchOk(jsonResponseBody);

        const response = await kucoinService.fetchTradeHistory('ETH-USDT');

        const expectedResponse = [
            new Trade(1, 'buy', 2002, 1705264074092000000),
            new Trade(2, 'sell', 2001, 1705264074111000000)
        ];
        expect(response).toEqual(expectedResponse);
    });
});