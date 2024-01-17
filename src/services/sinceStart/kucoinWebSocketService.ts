import { RawData } from 'ws';
import { ExchangeWebSocketServiceInterface } from '../exchangeInterfaces';
import { SUPPORTED_TRADING_PAIRS } from '../../utils/constants/constants';
import { KucoinMatchExecutionMessage } from '../../models/kucoinMatchExecutionMessage';


export class KucoinWebSocketService implements ExchangeWebSocketServiceInterface {
    cumulativeDelta: Map<String,number> = new Map();
    tradeCount: number = 0;

    constructor() {
        for (let tradingPair of SUPPORTED_TRADING_PAIRS) {
            this.cumulativeDelta.set(tradingPair, 0)
        }
    }

    handleMessage(websocketMessage: RawData) {
        console.log('Received message:', websocketMessage.toString());
        let message = new KucoinMatchExecutionMessage(websocketMessage)
        if ( ( message.type == "message" ) && ( message.subject == "trade.l3match" )  ){
            let tradingPair = message.topic.split(':')[1];
            if (!this.cumulativeDelta.has(tradingPair)) {
                console.log("received unsupported trading pair from exchange. Not supposed to happen");
            }
            else if (message.data.side === 'buy') {
                let prevValue = this.cumulativeDelta.get(tradingPair) as number;
                this.cumulativeDelta.set(tradingPair,  prevValue + parseFloat(message.data.size))
            } else if (message.data.side === 'sell') {
                let prevValue = this.cumulativeDelta.get(tradingPair) as number;
                this.cumulativeDelta.set(tradingPair,  prevValue - parseFloat(message.data.size))
            }
            this.tradeCount += 1

            console.log("side = ", message.data.side)
            console.log("size = ", message.data.size)
            console.log("cumulativeDelta delta = ", this.cumulativeDelta)
            console.log("tradeCount = ", this.tradeCount)
        }
    }


    handleError(error: Error) {
        console.error('WebSocket error:', error);
    }

    handleClose() {
        console.log('WebSocket connection closed');
    }

    getCumulativeDelta(tradingPair: String): number {
        return this.cumulativeDelta.get(tradingPair) ? this.cumulativeDelta.get(tradingPair) as number : 0
    }
}
