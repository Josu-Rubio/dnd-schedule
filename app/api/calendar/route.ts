import { NextResponse } from "next/server";
import getDayModel from "../../utils/getDayModel";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
        return NextResponse.json({ error: "guildId is required" }, { status: 400 });
    }

    try {
        const DayModel = await getDayModel(guildId);
        const days = await DayModel.find();

        const formattedDays = days.map((day) => {
            const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === "green").length;
            const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === "yellow").length;

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
        const { searchParams } = new URL(req.url);
        const guildId = searchParams.get("guildId");

        if (!guildId) {
            return NextResponse.json({ error: "guildId is required" }, { status: 400 });
        }

        const { date, state, userId, username, avatar } = await req.json();

        const DayModel = await getDayModel(guildId);
        const day = await DayModel.findOne({ date });

        if (day) {
            // Check if the user has already voted
            const existingVote = day.votes.find((vote) => vote.userId === userId);

            if (existingVote) {
                // Update the state of the existing vote
                existingVote.state = state;
            } else {
                // Add a new vote with the current state
                day.votes.push({ userId, username, avatar, state });
            }

            await day.save(); // Save the updated document
        } else {
            // Create a new day document if it doesn't exist
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
        const { searchParams } = new URL(req.url);
        const guildId = searchParams.get("guildId");

        if (!guildId) {
            return NextResponse.json({ error: "guildId is required" }, { status: 400 });
        }

        const { date, userId } = await req.json();

        const DayModel = await getDayModel(guildId);

        const day = await DayModel.findOne({ date });

        if (!day) {
            return NextResponse.json({ error: "Day not found" }, { status: 404 });
        }

        // Remove the user's vote from the votes array
        day.votes = day.votes.filter((vote: { userId: string }) => vote.userId !== userId);

        // Save the updated day document
        await day.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting vote:", error);
        return NextResponse.json({ error: "Failed to delete vote" }, { status: 500 });
    }
}
