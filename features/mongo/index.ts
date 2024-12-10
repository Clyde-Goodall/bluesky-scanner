import {MongoClient, ServerApiVersion} from 'mongodb';
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_CLUSTER_URI as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: false,
    }
});


export async function insertNewFind(msg) {
    try {
        const db = client.db(process.env.DATABASE as string);
        const collection = db.collection(process.env.COLLECTION as string);
        await collection.insertOne(msg);
    } catch(e) {
        console.log(e);
    }
}