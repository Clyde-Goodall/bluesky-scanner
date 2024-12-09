import WebSocket from "ws";
import { insertNewFind } from "./features/mongo/index.js";

export default class BlueskyScanner {
    constructor() {
      this.client = new WebSocket(
        "wss://jetstream2.us-west.bsky.network/subscribe"
      );
      this.messageStack = [];
    }
  
    async run(filterFunction) {
      this.client.onmessage = (event) => {
        this.incomingMessageHandler(JSON.parse(event.data), filterFunction);
      };
    }
  
    async incomingMessageHandler(obj, filterFunction) {
      const text = obj?.commit?.record?.text ?? false;
      const intersection = text ? filterFunction(text) : false;
      
      if(intersection) {
        await insertNewFind(obj.commit);
        this.messageStack.push(text);
        console.log(text);
      }
    }
  }
  
  // Define your custom filter function
  function customFilter(input) {
    const phrases = [
        "new crypto project",
        "influencer crypto",
        "influencer coin",
        "new solana",
    ];
    return phrases.some(str => 
      input.toLowerCase().includes(str.toLowerCase())
    );
  }
  
  // Create instance and run with the custom filter
  const instance = new BlueskyScanner();
  (async () => {
    await instance.run(customFilter);
  })();