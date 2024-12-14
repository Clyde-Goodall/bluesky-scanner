import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.ts";
import type { JetstreamEvent } from "./types/index.ts";
import {getChatCompletion} from './features/llm/index.ts';
import {printer} from './features/index.ts';
import dotenv from "dotenv";
dotenv.config();
const ENV = process.env.ENV; 

interface Handler {
    callback: Function;
}
// subscribes to websocket of bluesky's jetstream, feeds incoming messages through an optional filter,
// then through an optional OpenAI chat completion, and finally an optional mongodb insert.
export default class BlueskyScanner {
    handlers: Handler[]
    useMongo?: boolean
    client: WebSocket
    useLlm?: boolean
    llmLogic?: Function
    mongoLogic?: Function
    mongoInsertDefault: boolean
    filterFunction?: Function
        constructor({
        useMongo=false, 
        useLlm=false,
        //@ts-ignore
        filterFunction, llmLogic, mongoLogic,
        source="wss://jetstream2.us-west.bsky.network/subscribe",
        mongoInsertDefault=true,
    }) { // this whole config could be organized better tbh, should just go all-inon stratifying by utility
        this.handlers = []; 
        this.useMongo = useMongo;
        this.useLlm = useLlm;
        this.llmLogic = useLlm ? llmLogic : undefined;
        this.client = new WebSocket(source);
        this.mongoLogic = useMongo ? mongoLogic : undefined;
        this.mongoInsertDefault = useMongo ? mongoInsertDefault : false;
        this.filterFunction = filterFunction;
        this.connect();
    }
    // Takes array of functions and runs incoming websocket events through user-provided filters
    // If none are provided, uses default option and displays all traffic
    private connect() {
        printer("Hunting down cool posts...", "heading");
        this.client.onmessage = (event) => {
            const eventString = JSON.parse(event.data.toString()); 
            this.handlers.forEach(({ callback }) => {
                this.incomingMessageHandler(eventString, callback);
            });
        };
    }

    // handles event data through user-provided logic
    private async incomingMessageHandler(obj: JetstreamEvent, callback: Function) {
        const text = this.eventMessageText(obj);
        let matches = false;
        if(this.filterFunction === undefined) { // no matches on the filter
            matches = true; // defaults to yes unless a filter has been provided
        } else {
            try { 
                matches = text ? this.filterFunction(text) : false; // potentially want to specify how many filters it matches
            } catch(e) {
                console.log(e);
            }
        }
        if(!matches) return // filter guard

        if(ENV === "dev") {
            printer("Skeet found", "header");
            printer(text as string, "body");
        }
        let llmPrompt = null;
        if(this.llmLogic !== undefined && this.useLlm) { 
            try { // takes bluesky text and interpolates it into the prompt provided by the function
                llmPrompt = this.llmLogic(text as string);
            } catch(e) {
                console.log(e);
            }
        }
        const llmOutput = this.useLlm && llmPrompt ? await getChatCompletion(llmPrompt as string) : null; // using this to transform incoming message into usable json
        let outputAsJson = null;
        try {
            outputAsJson = this.useLlm ? JSON.parse(llmOutput as string) : null;
            if(ENV == "dev" && this.useLlm) {
                printer("Chat completion", "header");
                printer(`${outputAsJson}`, "body");
            }
        } catch(e) {
            console.log(e); // this absolutely should have the option to be logged to a database somewhere tbh
        }
        let checkIfDoInsert = this.mongoInsertDefault; // again, defaults to true if user wants to log but provides no logic
        if(this.useMongo && this.mongoLogic !== undefined) {
            try {
                checkIfDoInsert = this.mongoLogic(outputAsJson);
            } catch(e) {
                console.log(e);
            }
        } 
        if(checkIfDoInsert) {
            try {
                await insertNewFind(llmOutput as string);
                printer("Record Inserted", "header");

            } catch(e) {
                console.log(e);
            }
        } 
    }

    public on(callback: Function): this {
        this.handlers.push({ callback });
        return this;
    }

    public close() {
        if (this.client) {
          this.client.close();
        }
      }
    // returns text field from current event as string
    private eventMessageText(obj: JetstreamEvent): string | null{
        const text = obj?.commit?.record?.text ?? null;
        return text;
    }
}
  