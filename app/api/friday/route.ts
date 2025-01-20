// app/api/best-day/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { startOfWeek, endOfWeek, addDays, format, parseISO } from 'date-fns';
import { sendMessageToDiscord } from '../../utils/discordBot';

if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || '');
}

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
});

const DayModel = mongoose.models.Day || mongoose.model('Day', DaySchema);

export async function GET() {
    try {
        const today = new Date();
        const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextSunday = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });

        const startOfNextWeek = format(nextMonday, 'yyyy-MM-dd');
        const endOfNextWeek = format(nextSunday, 'yyyy-MM-dd');

        const days = await DayModel.find({
            date: { $gte: startOfNextWeek, $lte: endOfNextWeek },
        });

        const scores = days.map((day) => {
            const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === 'green').length;
            const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === 'yellow').length;
            const score = greenVotes * 1 + yellowVotes * 0.5;

            return { date: day.date, score, votes: day.votes };
        });

        const roleId = process.env.ROLE_ID;

        if (scores.length === 0) {
            // No votes for any day
            const embed = {
                title: 'Sois todos unos meirdas 💩',
                description: `Esta semana no ha votado nadie. A ver si para la siguiente os ponéis las pilas`,
                color: 0xff0000, // Red color
                footer: {
                    text: 'Organizado por Roleros',
                },
                timestamp: new Date().toISOString(),
            };

            await sendMessageToDiscord(`<@&${roleId}>`, embed);
            return NextResponse.json({ message: 'No votes found for next week' });
        }

        // Check total votes
        const totalVotes = scores.reduce((sum, day) => sum + day.score, 0);
        if (totalVotes <= 2) {
            // Less than 3 total votes
            const voters = scores.flatMap((day) => day.votes).map((vote) => `<@${vote.userId}>`);
            const embed = {
                title: 'No hay suficiente gente para jugar esta semana 😢',
                description: `Solo ${voters.length} persona(s) han votado. Gracias por intentarlo: ${voters.join(', ')}`,
                color: 0xffcc00, // Yellow color
                footer: {
                    text: 'Organizado por Roleros',
                },
                timestamp: new Date().toISOString(),
            };

            await sendMessageToDiscord(`<@&${roleId}>`, embed);
            return NextResponse.json({ message: 'Not enough votes for any day' });
        }

        // Find best day(s)
        const maxScore = Math.max(...scores.map((day) => day.score));
        const bestDays = scores.filter((day) => day.score === maxScore);

        const embed = {
            title: bestDays.length > 1 ? '📅 Empate en los mejores días para jugar' : '📅 Mejor día para jugar',
            description: bestDays.length > 1
                ? `Hay un empate entre los días:\n${bestDays
                    .map((day) => `**${format(parseISO(day.date), 'dd/MM/yyyy')}**`)
                    .join(', ')}`
                : `El mejor día para jugar es **${format(parseISO(bestDays[0].date), 'dd/MM/yyyy')}** 🎮`,
            fields: bestDays.map((day) => ({
                name: `Día: ${format(parseISO(day.date), 'dd/MM/yyyy')}`,
                value: day.votes.map((vote: { userId: string; username: string }) => `<@${vote.userId}>`).join('\n') || 'Nadie ha votado',
            })),
            color: 0x00ff00, // Green color
            footer: {
                text: 'Organizado por Roleros',
            },
            timestamp: new Date().toISOString(),
        };

        await sendMessageToDiscord(`<@&${roleId}>`, embed);

        return NextResponse.json({
            message: 'Best day(s) calculated and sent',
            bestDays: bestDays.map((day) => day.date),
        });
    } catch (error) {
        console.error('Error calculating best day for next week:', error);
        return NextResponse.json(
            { error: 'Failed to calculate best day for next week' },
            { status: 500 }
        );
    }
}
