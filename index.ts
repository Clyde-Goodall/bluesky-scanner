import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.ts";
import type { JetstreamEvent } from "./types/index.ts";
import {_getChatCompletion} from './features/llm/index.ts';
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
    sendIfNoLlm?: boolean
    filterFunction?: Function
        constructor({
        useMongo=false, 
        useLlm=false,
        //@ts-ignore
        filterFunction, llmLogic, mongoLogic,
        source="wss://jetstream2.us-west.bsky.network/subscribe",
        mongoInsertDefault=true,
        sendIfNoLlm=true
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
            const eventDataJSON = JSON.parse(event.data.toString()); 
            this.handlers.forEach(({ callback }) => {
                const filtered = this.incomingMessageHandler(eventDataJSON);
                if(!filtered) return;
                if(ENV === "dev") {
                    printer("Fuck", "heading");
                    printer(this.eventMessageText(eventDataJSON) as string, "body");
                }
                callback(eventDataJSON);
            });
        };
    }
    // returns boolean for passing/failing filter
    private incomingMessageHandler(obj: JetstreamEvent): boolean {
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
        return matches;
    }

    public async getChatCompletion(text: string, promptModifier: Function): Promise<JSON | null> {
        let llmPrompt = null;
        if(promptModifier === undefined) {
            return Promise.resolve(null)
        }
        llmPrompt = promptModifier(text as string);
        const llmOutput = llmPrompt ? await _getChatCompletion(llmPrompt as string) : null; // using this to transform incoming message into usable json
        let outputAsJson = null;
        try {
            outputAsJson = JSON.parse(llmOutput as string);
            if(ENV == "dev") {
                printer("Chat completion", "header");
                printer(`${outputAsJson}`, "body");
            }
            return outputAsJson;
        } catch(e) {
            console.log(e); // this absolutely should have the option to be logged to a database somewhere tbh
        }
        return Promise.resolve(null);
    }

    public async insertNewRecord(record: Object, insertLogic?: Function) {
        let checkIfDoInsert = this.mongoInsertDefault; // again, defaults to true if user wants to log but provides no logic
        if(insertLogic !== undefined) {
            try {
                checkIfDoInsert = insertLogic(record);
            } catch(e) {
                console.log(e);
            }
        } 
        if(!checkIfDoInsert) return
        try {
            await insertNewFind(record as string);
            printer("Record Inserted", "header");
        } catch(e) {
            console.log(e);
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
  