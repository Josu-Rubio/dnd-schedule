// app/api/monday-message/route.ts
import { NextResponse } from 'next/server';
import { startOfWeek, addDays, format, endOfWeek } from 'date-fns';
import { sendMessageToDiscord } from '../../utils/discordBot';

export async function GET() {
    try {
        const today = new Date();
        const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextSunday = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });

        // Format the first and last day of the week in the format dd/MM/yyyy
        const startDate = format(nextMonday, 'dd/MM/yyyy');
        const endDate = format(nextSunday, 'dd/MM/yyyy');

        const embed = {
            title: "Let's rol this week! 🎲",
            description: `Votad para ver qué días se pueden jugar la semana que viene.\n\n**Fechas disponibles:**\n${startDate} - ${endDate}\n\nGracias por participar en la planificación de nuestras partidas. ¡Esperamos veros allí!`,
            url: 'https://dnd-schedule.vercel.app/',
            color: 0x00ff00, // Green color
            footer: {
                text: 'Organizado por Roleros',
            },
            timestamp: new Date().toISOString(),
        };

        const roleId = process.env.ROLE_ID; // Use env variable for RoleID

        await sendMessageToDiscord(`<@&${roleId}>`, embed);

        return NextResponse.json({ message: 'Monday message sent successfully' });
    } catch (error) {
        console.error('Error sending Monday message:', error);
        return NextResponse.json(
            { error: 'Failed to send Monday message' },
            { status: 500 }
        );
    }
}
