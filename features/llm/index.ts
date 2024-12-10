// import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();
// const ENV: string = process.env.ENV;

// client = new OpenAI(process.env.OPENAI_SECRET_KEY);

// async function getValidScientificName(msg, prompt) {
//     chat_completion = await client.chat.completions.create(
//         messages=[
//             {
//                 "role": "user",
//                 "content": `${prompt}   -   ${message}`,
//             }
//         ],
//         model="gpt-4o",
//     );
//     output = chat_completion.choices[0].message.content
//     if(ENV == "DEV") {
//         console.log(`chat completion: ${chat_completion.choices}`);
//     }
//     if(output == false) return false;
//     return output
// }
