// Function to fetch trade history from Kucoin's API
export const fetchTradeHistory = async (pair: string) => {
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

        // Handle different response types (e.g., JSON or text)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('Error fetching trade history:', error);
        throw error;
    }
};



// Function to calculate cumulative delta
export const calculateCumulativeDelta = (trades: any[]) => {
    let delta = 0;
    trades.forEach(trade => {
        const tradeSize = parseFloat(trade.size);
        if (trade.side === 'buy') {
            delta += tradeSize;
        } else if (trade.side === 'sell') {
            delta -= tradeSize;
        }
    });
    return delta;
};
