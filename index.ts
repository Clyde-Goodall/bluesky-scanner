import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.ts";
import type { JetstreamEvent } from "./types/index.ts";
import {getChatCompletion} from './features/llm/index.ts';
import {printer} from './features/index.ts';
import dotenv from "dotenv";
dotenv.config();
const ENV = process.env.NODE_ENV; 
// subscribes to websocket of bluesky's jetstream, feeds incoming messages through an optional filter,
// then through an optional OpenAI chat completion, and finally an optional mongodb insert.
export default class BlueskyScanner {
    useMongo?: boolean
    client: WebSocket
    useLlm?: boolean
    llmLogic?: Function
    mongoLogic?: Function
    mongoInsertDefault: boolean
    constructor({
        useMongo=false, 
        useLlm=false,
        //@ts-ignore
        llmLogic, mongoLogic,
        source="wss://jetstream2.us-west.bsky.network/subscribe",
        mongoInsertDefault=true
    }) { // this whole config could be organized better tbh, should just go all-inon stratifying by utility
        this.useMongo = useMongo;
        this.useLlm = useLlm;
        this.llmLogic = useLlm ? llmLogic : undefined;
        this.client = new WebSocket(source);
        this.mongoLogic = useMongo ? mongoLogic : undefined;
        this.mongoInsertDefault = useMongo ? mongoInsertDefault : false;
    }

    // Takes array of functions and runs incoming websocket events through user-provided filters
    // If none are provided, uses default option and displays all traffic
    async incoming(filterFunctionList: Function) {
        printer("Hunting down cool posts...", "heading");
        this.client.onmessage = (event) => {
            // To remove ambiguity, typescript wants me to ensure it's a string before parsing to JSON :shrug:
            const eventString = JSON.parse(event.data.toString()); 
            if(!filterFunctionList) {// case where user does not provide filters
                this.incomingMessageHandler(eventString);
            } else { //case where user provides filter
                this.incomingMessageHandler(eventString, filterFunctionList);
            }
        };
    }

    // handles event data through user-provided logic
    async incomingMessageHandler(obj: JetstreamEvent, filterFunction?: Function) {
        const text = this.eventMessageText(obj);
        if(ENV == "dev") {
            printer("New post found", "header");
            printer(text as string, "body");
        }

        let matches = false;
        if(!filterFunction) { // no matches on the filter
            matches = true; // defaults to yes unless a filter has been provided
        } else {
            try {
                matches = text ? filterFunction(text) : false; 
            } catch(e) {
                console.log(e);
            }
        }
        if(matches) {
            let llmPrompt = null;
            if(this.llmLogic !== undefined) {
                try { // takes bluesky text and interpolates it into the prompt provided by the function
                    llmPrompt = this.llmLogic(text as string);
                } catch(e) {
                    console.log(e);
                }
            }
            const llmOutput = this.useLlm && llmPrompt ? await getChatCompletion(llmPrompt as string) : null; // using this to transform incoming message into usable json
            let outputAsJson = null;
            try {
                outputAsJson = JSON.parse(llmOutput as string);
                if(ENV == "dev") {
                    printer("Chat completion", "header");
                    printer(outputAsJson, "body");
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
    }
    // returns text field from current event as string
    eventMessageText(obj: JetstreamEvent): string | null{
        return obj?.commit?.record?.text ?? null;
    }
}
  