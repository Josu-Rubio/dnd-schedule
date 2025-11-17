// app/api/ready/route.ts
import { sendMessageToDiscord } from '../../utils/discordBot'; // Your existing function to send messages to Discord
import mongoose from 'mongoose';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI || '')
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));
}

// Schema Definition
const DaySchema = new mongoose.Schema({
    date: { type: String, required: true },
    votes: [
        {
            userId: { type: String, required: true },
            username: { type: String, required: true },
            avatar: { type: String },
            state: { type: String, enum: ['green', 'yellow'], required: true },
        },
    ],
    message: { type: Boolean, default: false }, // Added message field
});

const DayModel = mongoose.models.Day || mongoose.model('Day', DaySchema);

export async function GET() {
    try {
        const today = new Date();
        const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextSunday = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const startOfNextWeek = format(nextMonday, 'yyyy-MM-dd');
        const endOfNextWeek = format(nextSunday, 'yyyy-MM-dd');

        const roleId = process.env.ROLE_ID; // Use env variable for RoleID

        // Format the first and last day of the week in the format dd/MM/yyyy
        const startDate = format(nextMonday, 'dd/MM/yyyy');
        const endDate = format(nextSunday, 'dd/MM/yyyy');


        const dayOfWeek = today.getDay();
        // Check if it's Monday (1), Wednesday (3), or Friday (5)
        if (dayOfWeek === 1) {
            // Send the "Let's rol this week!" message
            const embedMonday = {
                title: "Let's rol this week! 🎲",
                description: `Votad para ver qué días se pueden jugar la semana que viene.\n\n**Fechas disponibles:**\n${startDate} - ${endDate}\n\nGracias por participar en la planificación de nuestras partidas. ¡Esperamos veros allí!`,
                url: 'https://schedule.josuerubio.com/',
                color: 0x00ff00, // Green color
                footer: {
                    text: 'Organizado por Roleros',
                },
                timestamp: new Date().toISOString(),
            };


            await sendMessageToDiscord(`<@&${roleId}>`, embedMonday);
        }

        // Fetch days from the database to check for eligible days
        console.log(`Checking for votes between ${startOfNextWeek} and ${endOfNextWeek}`);
        const days = await DayModel.find({
            date: { $gte: startOfNextWeek, $lte: endOfNextWeek },
        });

        const scores = days.map((day) => {
            const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === 'green').length;
            const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === 'yellow').length;
            const totalVotes = greenVotes * 1 + yellowVotes * 0.5;

            return { date: day.date, totalVotes, votes: day.votes, messageSent: day.message };
        });

        // Check for eligible days
        const eligibleDay = scores.find((score) => score.totalVotes >= 4 && !score.messageSent);
        if (eligibleDay) {
            console.log(`Eligible day found: ${eligibleDay.date} with ${eligibleDay.totalVotes} total votes`);

            const participants = eligibleDay.votes.map((vote: { userId: string; username: string }) => `<@${vote.userId}>`);

            const elegibleFormatDate = format(eligibleDay.date, 'dd/MM/yyyy')

            const embedReady = {
                title: "Tenemos sesión! 🎉",
                description: `El ${elegibleFormatDate} hay personas interesadas en jugar`,
                fields: [
                    {
                        name: "Participantes Disponibles",
                        value: participants.join("\n"),
                    },
                ],
                color: 0x00ff00,
                footer: {
                    text: "Organizado por Roleros",
                },
                timestamp: new Date().toISOString(),
            };

            await sendMessageToDiscord(`<@&${roleId}>`, embedReady);

            // Update the message field in the database
            await DayModel.updateOne(
                { date: eligibleDay.date },
                { $set: { message: true } }
            );
            console.log(`Message sent and updated for day: ${eligibleDay.date}`);
        } else {
            console.log('No eligible days found for next week or message already sent.');
        }

        return new Response(JSON.stringify({ message: 'Cron job executed successfully' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error executing cron job:', error);
        return new Response(JSON.stringify({ error: 'Failed to execute cron job' }), {
            status: 500,
        });
    }
}
