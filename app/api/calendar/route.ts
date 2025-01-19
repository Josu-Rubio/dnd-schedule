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
export async function GET() {
    try {
        const days = await DayModel.find();

        const formattedDays = days.map((day) => {
            const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === 'green').length;
            const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === 'yellow').length;

            return {
                date: day.date,
                green: greenVotes,
                yellow: yellowVotes,
                votes: day.votes,
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
            if (state === "none") {
                // If state is "none", we remove the user's vote
                day.votes = day.votes.filter((vote: { userId: string }) => vote.userId !== userId);
            } else {
                // Check if the user has already voted
                const existingVoteIndex = day.votes.findIndex((vote: { userId: string }) => vote.userId === userId);

                if (existingVoteIndex > -1) {
                    // Update the existing vote
                    day.votes[existingVoteIndex].state = state;
                } else {
                    // Add a new vote
                    day.votes.push({ userId, username, avatar, state });
                }
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

// DELETE: Remove a user's vote
export async function DELETE(req: Request) {
    try {
        const { date, userId } = await req.json();

        // Find the day entry based on the provided date
        const day = await DayModel.findOne({ date });

        if (!day) {
            return NextResponse.json({ error: "Day not found" }, { status: 404 });
        }

        // Filter out the user's vote from the votes array
        day.votes = day.votes.filter((vote: { userId: string }) => vote.userId !== userId);

        // Save the updated day document
        await day.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting vote:", error);
        return NextResponse.json({ error: "Failed to delete vote" }, { status: 500 });
    }
}
