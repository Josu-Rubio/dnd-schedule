import { NextResponse } from "next/server";
import mongoose from "mongoose";

// MongoDB connection
if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || "");
}

// Schema
const DaySchema = new mongoose.Schema({
    date: { type: String, required: true }, // Unique day key (e.g., "YYYY-MM-DD")
    votes: [
        {
            userId: { type: String, required: true }, // Unique identifier for the user
            username: { type: String, required: true },
            avatar: { type: String },
            state: { type: String, enum: ["green", "yellow"], required: true },
        },
    ],
});

const DayModel = mongoose.models.Day || mongoose.model("Day", DaySchema);

// GET: Retrieve all days
export async function GET(req: Request) {
    try {
        const days = await DayModel.find();

        const formattedDays = days.map((day) => {
            const green = day.votes.filter((vote: { state: string; }) => vote.state === "green").length;
            const yellow = day.votes.filter((vote: { state: string; }) => vote.state === "yellow").length;

            return {
                date: day.date,
                green,
                yellow,
                votes: day.votes, // Include raw votes for user-specific data
            };
        });

        return NextResponse.json(formattedDays);
    } catch (error) {
        console.error("Error fetching days:", error);
        return NextResponse.json({ error: "Failed to fetch days" }, { status: 500 });
    }
}

// POST: Save or update day
export async function POST(req: Request) {
    try {
        const { date, state, userId, username, avatar } = await req.json();

        const day = await DayModel.findOne({ date });

        if (day) {
            // Check if the user has already voted
            const existingVoteIndex = day.votes.findIndex((vote: { userId: string }) => vote.userId === userId);

            if (existingVoteIndex > -1) {
                // Update the existing vote
                day.votes[existingVoteIndex].state = state;
            } else {
                // Add a new vote
                day.votes.push({ userId, username, avatar, state });
            }

            await day.save();
        } else {
            // Create a new day entry with the user's vote
            await DayModel.create({
                date,
                votes: [{ userId, username, avatar, state }],
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating vote:", error);
        return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
    }
}
