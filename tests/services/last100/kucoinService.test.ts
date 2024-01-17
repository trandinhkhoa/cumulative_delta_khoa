import { Trade } from "../../../src/models/trade";
import { KucoinService } from "../../../src/services/last100/kucoinService";

describe('kucoinServiceTest', () => {
    let kucoinService: KucoinService
    beforeAll(() => {
        kucoinService = new KucoinService();
    })

    // Cleanup the mock after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should correctly calculates the delta', () => {
        const trades = [
            { size: 2, side: 'buy' },
            { size: 5, side: 'sell' },
            { size: 7, side: 'buy' }
        ] as unknown as Trade[];
        expect(kucoinService.calculateCumulativeDelta(trades)).toBe(4);
    });

    it('should throw an error if the request times out', async () => {
        // Simulate a delayed response
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout error'));
                }, 4500);
            });
        });

        await expect(kucoinService.fetchTradeHistory('ETH-USDT')).rejects.toThrow('Request timed out');
    });

    it('should return a successful response', async () => {
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

        // Simulate a 200 response
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

        const response = await kucoinService.fetchTradeHistory('ETH-USDT');

        const expectedResponse = [
            new Trade(1, 'buy', 2002, 1705264074092000000),
            new Trade(2, 'sell', 2001, 1705264074111000000)
        ];
        expect(response).toEqual(expectedResponse);
    });

    it('should return error if exchange return error', async () => {
        const jsonResponseBody = {
            "msg": "Bad Request",
            "code": "400000"
        };

        // Simulate a 4xx/5xx response
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return new Promise((resolve, reject) => {
                const exchangeResponse = new Response(JSON.stringify(jsonResponseBody), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                resolve(exchangeResponse)
            })
        });

        await expect(kucoinService.fetchTradeHistory('ETH-USDT')).rejects.toThrow('Error fetching data: 400');
    });
});