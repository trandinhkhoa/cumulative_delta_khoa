export class Trade {
    constructor(
        public size: number,
        public side: 'buy' | 'sell',
        public price: number,
        public time: number
    ) {}
}