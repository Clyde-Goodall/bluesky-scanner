import { test } from "node:test";
import BlueskyScanner from "../index.js";

const phrases = [
    "new crypto project",
    "influencer crypto",
    "influencer coin",
    "new solana",
    "#locapgem",
    "lowcapgem",
    "newcoinlisting",
    "lowcap",
    "cryptorevolution",
    "cryptogem",
    "ass"
];

test("Message content filtering function", async (t) => {
// Define your custom filter function
    function customFilter(input: string): boolean{
        // pay no heed to the example filters :^)

        const found = phrases.some(str => 
        input.toLowerCase().includes(str.toLowerCase())
        );
        return found;
    }
    
    function llmLogic(msg: string) { //whether it's relevant + reformat
        const prompt = `(If this following message indicates a new coin listing, 
        return the following as pure json filled in with the respective values and no decorators like '\`\`\`json': 
        {coin: name, exchange: platform, summary: summary of message}. Otherwise return null as raw value) 

        ${msg}`;

        return prompt;
    }

    function mongoLogic(incoming: Object) { // whether it should insert
        if(incoming == undefined || !incoming) return false
        if(Object.hasOwn(incoming, "coin") && Object.hasOwn(incoming, "platform")) {
            return true;
        }
        return false;
    }
    // Create instance and run with the custom filter
    const instance = new BlueskyScanner({
        filterFunction: customFilter,
        useMongo: true, 
        mongoLogic,
        useLlm: true, 
        llmLogic,
    });
    instance.on(async (res: any) => {
        // console.log(res);
        const llmOutput = await instance.getChatCompletion(res, llmLogic)
        const record = {...res, llmOutput}
        console.log(res)
        const insertion = await instance.insertNewRecord(record, mongoLogic)
    });
});

// test("Tests llm chat completion output", async (t) => {
//     const msg = `(If this following message indicates a new coin listing, \
//         return the following as pure json filled in with the respective values and no decorators like '\`\`\`json': 
//         {coin: name, exchange: platform, summary: summary of message}) 

//         New listing on 👉HTX
//         Coin: #BLUE 
//         Pairs:
//         #BLUEUSDT quote:#USDT 
//         #newcoinlisting #crypto #cryptonews #cryptoAlerts #altcoins #bitcoin #btc #blockchain #cryptocurrency #cryptotrading 
//         `;
    
//     const completion = await getChatCompletion(msg);
//     console.log(completion);
// // });