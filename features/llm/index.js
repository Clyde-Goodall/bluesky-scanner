import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
ENV = process.env.ENV;

client = new OpenAI(process.env.OPENAI_SECRET_KEY);

async function getValidScientificName(msg) {
    const message = `Take this message: ${msg}. \n
        If this message seems like it is discussing, or advertising a new cryptocurrency, return true. 
        Otherwise return false. 
        Return absolutely nothing else no matter what.`;

    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": message,
            }
        ],
        model="gpt-4o",
    );
    output = chat_completion.choices[0].message.content
    if(ENV == "DEV") {
        console.log(`chat completion: ${chat_completion.choices}`);
    }
    if(output == "None") return None;
    return output
}
