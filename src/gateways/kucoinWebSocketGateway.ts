import { WebSocket } from 'ws';
import { KucoinWebSocketService } from '../services/sinceStart/kucoinWebSocketService';
import { SUPPORTED_TRADING_PAIRS } from '../utils/constants/constants';


export class KucoinWebSocketGateway {
    cumulativeDelta: number = 0;
    tradeCount: number = 0;
    kucoinService: KucoinWebSocketService

    constructor(kucoinService: KucoinWebSocketService) {
        this.kucoinService = kucoinService;
    }

    private subscribeToTopic(socket: WebSocket, symbol: String) {
        const subscribeMessage = {
            id: Date.now().toString(),
            type: 'subscribe',
            topic: `/market/match:${symbol}`,
            privateChannel: false,
            response: true
        };
        socket.send(JSON.stringify(subscribeMessage));
        console.log(`Subscribed to ${symbol} match execution data`);
    }

    private startPing(socket: WebSocket, interval:number, connectionId: String) {
        setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ id: connectionId, type: 'ping' }));
            }
        }, interval);
    }

    async connect() {
        const requestOptions = {
            method: 'POST',
          };
        const fetchURL = `https://api.kucoin.com/api/v1/bullet-public`;
        const timeoutPromise = new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 2000)
        );

        const response: Response = await Promise.race([
            fetch(fetchURL, requestOptions),
            timeoutPromise,
        ]);

        const kucoinResponse = await response.json();
        console.log("websocket conenction repsonse ", kucoinResponse);
        const currentUnixTime = String(Date.now());
        const websocketConnectionString = 'wss://ws-api-spot.kucoin.com/?token=' + kucoinResponse.data.token + '&connectId=' + currentUnixTime;
        console.log("open websocket to ", websocketConnectionString)
        let socket = new WebSocket(websocketConnectionString);

        socket.on('open', () => {
            console.log('WebSocket connection established. Now subbing to topics... ');
            this.startPing(socket, kucoinResponse.data.instanceServers[0].pingInterval, currentUnixTime)
            for (let tradingpair of SUPPORTED_TRADING_PAIRS) {
                console.log("subbing to ", tradingpair)
                this.subscribeToTopic(socket, tradingpair);
            }
        });

        socket.on('message', (data) => {
            this.kucoinService.handleMessage(data);
        });

        socket.on('error', (error) => {
            this.kucoinService.handleError(error);
        });

        socket.on('close', () => {
            this.kucoinService.handleClose();
        });

    }
}
