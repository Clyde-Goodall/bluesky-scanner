import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.ts";
import type { JetstreamEvent } from "./types/index.ts";

export default class BlueskyScanner {
    useMongo: boolean
    client: WebSocket

    constructor({useMongo=false, source="wss://jetstream2.us-west.bsky.network/subscribe"}) {
        this.useMongo = useMongo;
        this.client = new WebSocket(source);
    }

    // Takes array of functions and runs incoming websocket events through user-provided filters
    // If none are provided, uses default option and displays all traffic
    async run(filterFunctionList: Array<Function>) {
        this.client.onmessage = (event) => {
            if(filterFunctionList.length == 0) {
                this.incomingMessageHandler(JSON.parse(event.data.toString()));
            } else {
                for(let i in filterFunctionList) {
                    this.incomingMessageHandler(JSON.parse(event.data.toString()), filterFunctionList[i]);
                }
            }
        };
    }

    // handles event data through user-provided logic
    async incomingMessageHandler(obj: JetstreamEvent, filterFunction?: Function) {
        const text = obj?.commit?.record?.text ?? false;
        let intersection = false;
        if(!filterFunction) {
            intersection = true;
        } else {
            intersection = text ? filterFunction(text) : false;
        }
        
        if(intersection) {
            await insertNewFind(obj);
            console.log(text);
        }
    }
}
  
