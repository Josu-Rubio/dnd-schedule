// app/utils/cron.ts
import cron from "node-cron";
import { sendMessageToDiscord } from "./discordBot"; // Import your message sending function
import mongoose from "mongoose";
import { startOfWeek, endOfWeek, addDays, format } from "date-fns";

// MongoDB connection setup
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI || "");
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

console.log("cron is working")

// Function to initialize cron jobs
export function initializeCronJobs() {
    // Cron check
    cron.schedule('* * * * *', async () => {  // Every minute
        console.log('Cron job triggered at:', new Date().toISOString());
        // Existing cron job logic...
    });

    // Cron to check if 4 people can play a day
    cron.schedule('* * * * *', async () => {  // Every minute
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
            const totalVotes = greenVotes * 1 + yellowVotes * 0.5;

            return { date: day.date, totalVotes, votes: day.votes };
        });

        // Check if any day has 4 people eligible to play
        const eligibleDay = scores.find((score) => score.totalVotes >= 4);
        if (eligibleDay) {
            // Send message with embed
            const participants = eligibleDay.votes.map((vote: {
                userId: any; username: string
            }) => `<@${vote.userId}>`);
            const embed = {
                title: "People ready to play!",
                description: `The best day to play is: ${eligibleDay.date}`,
                color: 0x00FF00,
                fields: [
                    { name: "Participants", value: participants.join("\n"), inline: false }
                ]
            };
            const message = "Here is the group ready to play!";
            await sendMessageToDiscord(message, embed);
        } else {
            console.log("eligibleDay not yet prepared")
        }
    });

    // Cron to remind users to update the calendar every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {  // Monday 9 AM
        const embed = {
            title: "Reminder: Update your availability",
            description: "Please make sure to update the calendar for the next week!",
            color: 0xFFFF00,
        };
        const message = "Hey everyone! Don't forget to update the calendar for next week.";
        await sendMessageToDiscord(message, embed);
    });

    // Cron to remind users every Friday at 9:00 AM about the best day for next week
    cron.schedule('0 9 * * 5', async () => {  // Friday 9 AM
        // Fetch the best day for next week
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

            return { date: day.date, score };
        });

        const bestDay = scores.reduce((prev, current) => (prev.score > current.score ? prev : current));
        const embed = {
            title: "Best day for next week",
            description: `The best day to play is: ${bestDay.date}`,
            color: 0x00FF00,
        };
        const message = "This is the best day to play next week!";
        await sendMessageToDiscord(message, embed);
    });
}
