import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.ts";
import type { JetstreamEvent } from "./types/index.ts";

export default class BlueskyScanner {
    useMongo: boolean
    client: WebSocket

    constructor({
        useMongo=false, 
        source="wss://jetstream2.us-west.bsky.network/subscribe"
    }) {
        this.useMongo = useMongo;
        this.client = new WebSocket(source);
    }

    // Takes array of functions and runs incoming websocket events through user-provided filters
    // If none are provided, uses default option and displays all traffic
    async onmessage(filterFunctionList: Array<Function>, ) {
        this.client.onmessage = (event) => {
            // To remove ambiguity, typescript wants me to ensure it's a string before parsing to JSON :shrug:
            const eventString = JSON.parse(event.data.toString()); 
            // case where user does not provide filters
            if(filterFunctionList.length == 0) {
                this.incomingMessageHandler(eventString);
            } else { //case where user provides at least one filter
                for(let i in filterFunctionList) {
                    this.incomingMessageHandler(eventString, filterFunctionList[i]);
                }
            }
        };
    }

    // handles event data through user-provided logic
    async incomingMessageHandler(obj: JetstreamEvent, filterFunction?: Function) {
        const text = this.eventMessageText(obj);
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
    // returns text field from current event as string
    eventMessageText(obj: JetstreamEvent): string | null{
        return obj?.commit?.record?.text ?? null;
    }
}
  
