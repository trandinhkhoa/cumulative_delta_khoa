import { KucoinWebSocketService } from "../../../src/services/sinceStart/kucoinWebSocketService";

function jsonObjectToRawData(jsonObject: any): Uint8Array {
    const jsonString = JSON.stringify(jsonObject);
    const textEncoder = new TextEncoder();
    return textEncoder.encode(jsonString);
  }

describe('kucoinWebSocketServiceTest', () => {
    let kucoinWebSocketService: KucoinWebSocketService
    beforeAll(() => {
        kucoinWebSocketService = new KucoinWebSocketService();
    })
    it('should return 0', () => {
        expect(kucoinWebSocketService.getCumulativeDelta('ETH-USDT')).toBe(0);
    });
    it('correctly calculates the delta', () => {
        let wsMessage = {
            "topic": "/market/match:ETH-USDT",
            "type": "message",
            "data": {
                "makerOrderId": "65a710d5816cce000748b147",
                "price": "2595.9",
                "sequence": "6103747718825985",
                "side": "sell",
                "size": "10",
                "symbol": "ETH-USDT",
                "takerOrderId": "65a710ead1aa940007af3ee1",
                "time": "1705447658162000000",
                "tradeId": "6103747718825985",
                "type": "match"
            },
            "subject": "trade.l3match"
        }
        let jsonString = JSON.stringify(wsMessage);
        kucoinWebSocketService.handleMessage(Buffer.from(jsonString));
        expect(kucoinWebSocketService.getCumulativeDelta('ETH-USDT')).toBe(-10);

        wsMessage = {
            "topic": "/market/match:ETH-USDT",
            "type": "message",
            "data": {
                "makerOrderId": "65a710d5816cce000748b147",
                "price": "2595.9",
                "sequence": "6103747718825985",
                "side": "buy",
                "size": "20",
                "symbol": "ETH-USDT",
                "takerOrderId": "65a710ead1aa940007af3ee1",
                "time": "1705447658162000000",
                "tradeId": "6103747718825985",
                "type": "match"
            },
            "subject": "trade.l3match"
        }
        jsonString = JSON.stringify(wsMessage);
        kucoinWebSocketService.handleMessage(Buffer.from(jsonString));
        expect(kucoinWebSocketService.getCumulativeDelta('ETH-USDT')).toBe(10);
    });
});
