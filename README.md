# Requirements
As a market maker, having an index that indicates our current cumulative delta on a specific trading pair is essential. It’s used by risk management to evaluate our current position and if we need to take some actions.
To do that, we are consuming the trades to calculate the cumulative delta.

Example: the delta index starts at 0. (We are delta neutral, we haven’t bought nor sold any token yet).

Each time we have a buy or sell order, we increment or decrease the delta.


Iteration |  Incoming trade  | Cumulative delta state

1         |          None    |  0

2         | BUY of 2 tokens  |  2

3         | SELL of 5 tokens | -3


### GOALS

Expose a REST API which gives us the cumulative delta of a specific trading pair.

### SPECIFICATIONS

Your mission, if you accept it, is to fetch the public trades history for a specific pair on the exchange Kucoin. Compute the cumulative delta index from the historical trades and return it.
The proposed design should take in consideration that you will add new exchanges or trading pairs later

### Requirements

- Use NodeJS and Typescript
- You will have to publish your source code in a VCS

The delivered implementation should be battle-tested!
You should rely on the exchange API for the integration (not a third party one)

# Install and Launch
## Install
```
npm install
```
## Launch
```
npm start
```
The application will launch at port 3000
## Try it
```
curl -v "http://localhost:3000/api/cumulative-delta/ETH-USDT"
```
## Test
```
npm test
```

Run test with coverage report
```
npm run test:coverage
```

# APIs

### 1. Retrieves the cumulative delta for the last 100 trades for a specified trading pair

- **HTTP Method**: GET
- **Path**: `/api/cumulative-delta/:pair`
    - Path Parameters:
        - pair: String - The trading pair for which the cumulative delta is calculated (only `ETH-USDT` supported for now).
- **Response**:
    - Successful Response:
        - 200 OK
            - Body:
                ```json
                {
                    "cumulativeDelta": number
                }
                ```
    - Error Responses:
        - 400 Bad Request
            - Occurs when an unsupported trading pair is requested.
            - Body:
                ```json
                {
                    "error": "Trading pair {pair} is not supported"
                }
                ```
        - 500 Internal Server Error
            - General server error (e.g., issues with fetching data from the exchange).
            - Body:
                ```json
                    {
                        "error": "Error fetching data: [error details]"
                    }
                ```

### 2. Retrieves the cumulative delta for the specified pair since the time we start the applciation

- **HTTP Method**: GET
- **Path**: `/api/cumulative-delta-real/:pair`
    - Path Parameters:
        - pair: String - The trading pair for which the cumulative delta is calculated (only `ETH-USDT` supported for now).
- **Response**:
    - Successful Response:
        - 200 OK
            - Body:
                ```json
                {
                    "cumulativeDelta": number
                }
                ```
    - Error Responses:
        - 400 Bad Request
            - Occurs when an unsupported trading pair is requested.
            - Body:
                ```json
                {
                    "error": "Trading pair {pair} is not supported"
                }
                ```
        - 500 Internal Server Error
            - General server error (e.g., issues with fetching data from the exchange).
            - Body:
                ```json
                    {
                        "error": "Error fetching data: [error details]"
                    }
                ```

# Remarks:
- **Functional**:
    - This application only return the cumulative delta for the last 100 trades
        - for a specific pair : `ETH-USDT`
    - I originally wanted to add options to specify how far back in time the cumulated delta my API should return. For example, cumulated delta over the past day, past week, etc. But:
        - Kucoin Get Trade Histories endpoint only return the last 100 transaction records (https://www.kucoin.com/docs/rest/spot-trading/market-data/get-trade-histories) without the ability to specify a timeframe for those records.
        - Therefore it's not possible to do what I wanted
    - There is also the option of running in the background a job that call the KuCoin Get Trade Histories within very short intervals repeatedly, then using the timestamp to stitch the results together, building a database of this info, and calculating the cumulative data from there. But there are several problems:
        - There is no telling how short the intervals should be. It depends on the amount of trade per seconds occured on KuCoin. Popular pair like BTC-USDT has easily much more than 1000s trade per seconds, so calling KuCoin Get Trade Histories API every seconds will still resulting in missing at least 1000-100 = 900 per second for example.
    - Furthermore, the assignment asked me to "fetch public trades history", which what the KuCoin API above was about, so I used it
    - This application only take data from Kucoin Spot Trading. Because:
        - It's simpler,
        - It represents the actual buying and selling of the asset
- **Non-functional**:
    - the project is structured so that: `app.ts` depends on `controllers`, which depends on `services`, which depends on `models`
    - ***for addition of new exchange***, e.g. Binance, just need to create a `BinanceService` class, implementing the interface `Exchange`. It should not affect `controllers` much or even not at all.
        - Because `controllers` is already using only `Exchange`'s methods
        - The assignment did not ask for cumulative delta across all exchange. But I did it, with just 1 exchange, it does not make any difference anyway. It is only to demonstrate how easy it would be to add a new exchange as described just now, and the cumulative delta will automatically still the sum across all exchange.
        - While functionally the same, different exchanges might still have slightly different format for their response. So I created a `Trade` class to standardize the trade data (e.g size, buyer or seller, etc) so that the code is not coupled with the choice of any exchange.
- **Future Improvement**
    - If I have the chance to discuss and clarify more about the requirements, I would propose something like:
        - Another idea is to open a websocket to https://www.kucoin.com/docs/websocket/spot-trading/public-channels/match-execution-data. Overtime, I will be able to accumulate a database of this info, and will be able to calculate the cumulative delta over the past several hours, days, weeks, etc.
            - Pros:
                - able to create our databases of all executed trades, allowing a richer set of features in the futures: e.g. calculate cumulative delta over a specific timeframe.
            - Cons:
                - storing individual trades for frequently traded pairs means storing a lot of data
                    - calculating the delta over a specific timeframe over this huge dataset might be a challenge
                        - a time-series database like `InfluxDB` might be useful
                - in the future we will add more exchanges and pair, listening for every trades for each of them will put a huge load on our application
            - GET `/api/cumulative-delta-real/:pair` implement this solution. But because of the cons and uncertainty above, I did not add much tests nor structured the code around this solution.

        - Another idea is to open a websocket to this endpoint https://www.kucoin.com/docs/websocket/spot-trading/public-channels/symbol-snapshot. That way, I can accumulate the the `buy` and `sell` quantity for a given pair every 2 seconds. Then, when the user use my API to get the cumulative delta, I am not limited to the last 100 trades for a specific pair, but instead I will be able to return the cumulative delta since the start of the our application.
            - Cons:
                - this API is for a market (e.g. BTC), not for a trading pair (e.g. BTC-USDT)
    - Both these improvements require websocket, but KuCoin API documentation for websocket is not very clear.
        - for example for the ping that keeps the connection alive https://www.kucoin.com/docs/websocket/basic-info/ping
            - it's is not clear whether `id` is unique to a ping message or the identifer of the connection
