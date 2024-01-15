// Function to fetch trade history from Kucoin's API
import { Exchange } from '../interfaces/exchange';
import { Trade } from '../models/Trade';

export class KucoinService implements Exchange {
    async fetchTradeHistory(pair: string): Promise<Trade[]> {
        // Kucoin-specific fetch logic
        try {
            const fetchURL = `https://api.kucoin.com/api/v1/market/histories?symbol=${pair}`;
            console.log('Fetching from ... ', fetchURL);

            // Set a timeout for the fetch request (e.g., 4 seconds)
            const timeoutPromise = new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 4000)
            );

            const response: Response = await Promise.race([
                fetch(fetchURL),
                timeoutPromise,
            ]);

            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }

            const kucoinResponse = await response.json();
            return kucoinResponse.data.map((item: any) => new Trade(
                parseFloat(item.size),
                item.side,
                parseFloat(item.price),
                item.time
            ));
        } catch (error) {
            console.error('Error fetching trade history:', error);
            throw error;
        }
    }

    calculateCumulativeDelta(trades: Trade[]): number {
        // Kucoin-specific delta calculation
        let delta = 0;
        trades.forEach(trade => {
            if (trade.side === 'buy') {
                delta += trade.size;
            } else if (trade.side === 'sell') {
                delta -= trade.size;
            }
        });
        return delta;
    }
}