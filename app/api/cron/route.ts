// app/api/cron/route.ts (or pages/api/cron.js for pages-based Next.js)
import { NextResponse } from 'next/server';

export async function GET(req) {
    // Check for valid authorization header
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Your cron job logic here, e.g., sending messages to Discord or any tasks
    console.log('Cron job triggered at', new Date());

    // Send success response
    return NextResponse.json({ message: 'Cron job completed successfully!' });
}

