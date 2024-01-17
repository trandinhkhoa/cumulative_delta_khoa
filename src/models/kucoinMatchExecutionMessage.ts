import { RawData } from "ws";

export class KucoinMatchExecutionMessage {
    topic: string;
    type: string;
    subject: string;
    data: {
        makerOrderId: string;
        price: string;
        sequence: string;
        side: string;
        size: string;
        symbol: string;
        takerOrderId: string;
        time: string;
        tradeId: string;
        type: string;
    };

    constructor(rawData: RawData) {
        let parsedData = JSON.parse(rawData.toString());
        this.topic = parsedData.topic;
        this.type = parsedData.type;
        this.subject = parsedData.subject;
        this.data = parsedData.data;
    }
}
