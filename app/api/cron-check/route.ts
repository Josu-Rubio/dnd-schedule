// app/api/cron-check/route.ts
import { initializeCronJobs } from '@/app/utils/cron';
import { NextResponse } from 'next/server';  // Correct import

export async function GET() {
    try {
        // Call the cron jobs initialization logic
        initializeCronJobs();

        return NextResponse.json({ message: 'Cron jobs initialized successfully!' });
    } catch (error) {
        console.error("Error triggering cron jobs:", error);
        return NextResponse.json({ error: 'Failed to initialize cron jobs' }, { status: 500 });
    }
}