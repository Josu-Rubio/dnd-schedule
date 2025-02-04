import mongoose from 'mongoose';
import { connectToDatabase } from "./dbConnect";

async function getDayModel(guildId: string) {
    let dbName;
    switch (guildId) {
        case "1214249928772165632":
            dbName = "calle";
            break;
        case "304091554467807234":
            dbName = "test";
            break;
        default:
            dbName = "test"; // Optional: Set a default value if needed
    }
    const connection = await connectToDatabase(dbName);

    const DaySchema = new mongoose.Schema({
        date: { type: String, required: true },
        votes: [
            {
                userId: { type: String, required: true },
                username: { type: String, required: true },
                avatar: { type: String, required: true },
                state: {
                    type: String,
                    enum: ['green', 'yellow', 'none'], // Add 'none' here
                    required: true
                },
            },
        ],
    });

    return connection.models.Day || connection.model("Day", DaySchema);
}

export default getDayModel;