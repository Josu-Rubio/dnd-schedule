// app/api/best-day/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { startOfWeek, endOfWeek, addDays, format } from "date-fns";
import { sendMessageToDiscord } from "../utils/discordBot";

if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || "");
}

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

const DayModel = mongoose.models.Day || mongoose.model("Day", DaySchema);

export async function GET() {
    try {
        const today = new Date();
        const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextSunday = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });

        const startOfNextWeek = format(nextMonday, "yyyy-MM-dd");
        const endOfNextWeek = format(nextSunday, "yyyy-MM-dd");

        const days = await DayModel.find({
            date: { $gte: startOfNextWeek, $lte: endOfNextWeek },
        });

        const scores = days.map((day) => {
            const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === "green").length;
            const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === "yellow").length;
            const score = greenVotes * 1 + yellowVotes * 0.5;

            return { date: day.date, score, votes: day.votes };
        });

        const bestDay = scores.reduce((prev, current) => (prev.score > current.score ? prev : current));

        const participants = bestDay.votes.map((vote: { username: string }) => vote.username);

        // const message = `The best day for playing is: ${bestDay.date} and these people are available:\n${participants.join("\n")}`;

        const message = `Testing message to discord?`

        await sendMessageToDiscord(message);

        return NextResponse.json({
            bestDay: bestDay.date,
            participants,
        });
    } catch (error) {
        console.error("Error fetching best day for next week:", error);
        return NextResponse.json({ error: "Failed to fetch best day for next week" }, { status: 500 });
    }
}
