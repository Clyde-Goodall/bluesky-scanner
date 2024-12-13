import { test } from "node:test";
import BlueskyScanner from "../index.js";
import { getChatCompletion } from "../features/llm/index.ts";

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
];

test("Message content filtering function", async (t) => {
// Define your custom filter function
    function customFilter(input: string) {
        // pay no heed to the example filters :^)

        return phrases.some(str => 
        input.toLowerCase().includes(str.toLowerCase())
        );
    }

    function llmLogic(msg: string) {
        const prompt = `(If this following message indicates a new coin listing, 
        return the following as pure json filled in with the respective values and no decorators like '\`\`\`json': 
        {coin: name, exchange: platform, summary: summary of message}) 

        ${msg}`;

        return prompt;
    }

    function mongoLogic(incoming: Object) {
        if(Object.hasOwn(incoming, "coin") && Object.hasOwn(incoming, "platform")) {
            return true
        }
    }
    // Create instance and run with the custom filter
    const instance = new BlueskyScanner({
        useMongo: true, 
        mongoLogic,
        useLlm: true, 
        llmLogic, 
    });
    await instance.incoming(customFilter);
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