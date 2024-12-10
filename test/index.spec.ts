import { test } from "node:test";
import BlueskyScanner from "../index.js";

const exaxmples = [
    ""
];

test("Message content filtering function", async (t) => {
// Define your custom filter function
    function customFilter(input: string) {
        // pay no heed to the example filters :^)
        const phrases = [
            "new crypto project",
            "influencer crypto",
            "influencer coin",
            "new solana",
            "#locapgem",
            "lowcap",
            "altcoins",
            "cryptorevolution",
            "cryptogem",
        ];
        return phrases.some(str => 
        input.toLowerCase().includes(str.toLowerCase())
        );
    }
    async function basicFilter(input: string) {
        // pay no heed to the example filters :^)
        const phrases = [
            "piss",
        ];
        return phrases.some(str => 
        input.toLowerCase().includes(str.toLowerCase())
        );
    }
    // Create instance and run with the custom filter
    const instance = new BlueskyScanner({useMongo: false});
        await instance.run([
            customFilter, 
            basicFilter
        ]);
});