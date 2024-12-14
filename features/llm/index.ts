import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const ENV: string = process.env.ENV as string ?? null;
//  as string
const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY
});

export async function _getChatCompletion(msg: string) {
    const chat_completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                "role": "user",
                "content": msg,
            }
        ],
    });
    const output = chat_completion!.choices[0]!.message.content
    // if(ENV == "dev") {
    //     printer(`chat completion: ${chat_completion.choices}`, "body");
    // }
    return output;
}
