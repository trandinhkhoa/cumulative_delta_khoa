# Requirements
As a market maker, having an index that indicates our current cumulative delta on a specific trading pair is essential. It’s used by risk management to evaluate our current position and if we need to take some actions.
To do that, we are consuming the trades to calculate the cumulative delta.

Example: the delta index starts at 0. (We are delta neutral, we haven’t bought nor sold any token yet).

Each time we have a buy or sell order, we increment or decrease the delta.


Iteration |  Incoming trade  | Cumulative delta state
1         |          None    |  0
2         | BUY of 2 tokens  |  2
3         | SELL of 5 tokens | -3


GOALS
Expose a REST API which gives us the cumulative delta of a specific trading pair.

SPECIFICATIONS
Your mission, if you accept it, is to fetch the public trades history for a specific pair on the exchange Kucoin. Compute the cumulative delta index from the historical trades and return it.
The proposed design should take in consideration that you will add new exchanges or trading pairs later

Requirements
- Use NodeJS and Typescript
- You will have to publish your source code in a VCS

The delivered implementation should be battle-tested!
You should rely on the exchange API for the integration (not a third party one)
