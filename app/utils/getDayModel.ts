import mongoose from 'mongoose';
import { connectToDatabase } from "./dbConnect";

async function getDayModel(guildId: string) {
    const dbName = guildId === "1214249928772165632" ? "calle" : "test";
    const connection = await connectToDatabase(dbName);

    const DaySchema = new mongoose.Schema({
        date: { type: String, required: true },
        votes: [
            {
                userId: { type: String, required: true },
                username: { type: String, required: true },
                avatar: { type: String },
                state: { type: String, enum: ["green", "yellow"], required: true },
            },
        ],
    });

    return connection.models.Day || connection.model("Day", DaySchema);
}

export default getDayModel;