// /src/app/api/discharge-history/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/library/connectDB';
import DischargeLog from '@/models/DischargeLog';

export async function GET() {
    try {
        await connectDB();

        const summaries = await DischargeLog.find().sort({ createdAt: -1 });

        return NextResponse.json(summaries);
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Failed to fetch discharge summaries.' }, { status: 500 });
    }
}
