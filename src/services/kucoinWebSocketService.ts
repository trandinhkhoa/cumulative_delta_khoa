// src/services/kucoinWebSocketService.ts
import { WebSocket } from 'ws';
import { Trade } from '../models/trade';


export class KucoinWebSocketService {
    // private socket: WebSocket;
    private tradeData: Trade[] = [];
    cumulativeDelta: number = 0;
    tradeCount: number = 0;

    constructor() {
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
            method: 'POST', // HTTP method
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
        console.log("websocket to ", websocketConnectionString)
        let socket = new WebSocket(websocketConnectionString);
        socket.on('open', () => {
            console.log('WebSocket connection established');
            this.startPing(socket, kucoinResponse.data.instanceServers[0].pingInterval, currentUnixTime)
            this.subscribeToTopic(socket, 'ETH-USDT');
        });
        socket.on('message', (data) => {
            console.log('Received message:', data.toString());
            let dataJson = JSON.parse(data.toString());
            // console.log("json = ", dataJson)
            if ( ( dataJson.type == "message" ) && ( dataJson.subject == "trade.l3match" )  ){
                if (dataJson.data.side === 'buy') {
                    this.cumulativeDelta += parseFloat(dataJson.data.size);
                } else if (dataJson.data.side === 'sell') {
                    this.cumulativeDelta -= parseFloat(dataJson.data.size);
                }
                console.log("side = ", dataJson.data.side)
                console.log("size = ", dataJson.data.size)
                console.log("cumul delta = ", this.cumulativeDelta)
                this.tradeCount += 1
                console.log(this.tradeCount)
            }
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.on('close', () => {
            console.log('WebSocket connection closed');
            // Handle reconnection if necessary
        });

    }

    getCumulativeDelta() {
        return this.cumulativeDelta
    }
}
