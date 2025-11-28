// /app/api/patient-record/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/library/prisma';

// --- GET patient records ---
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'DOCTOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const records = await prisma.patientRecord.findMany({
            where: {
                doctorId: session.user.id,
                deleted: false, // only non-deleted
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching patient records:', error);
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
}

// --- POST new record ---
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'DOCTOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, gender, weight } = body;

    try {
        const record = await prisma.patientRecord.create({
            data: {
                doctorId: session.user.id,
                name,
                age: parseInt(age),
                gender,
                weight: parseFloat(weight),
            },
        });

        return NextResponse.json({ success: true, record });
    } catch (err) {
        console.error('Error adding patient record:', err);
        return NextResponse.json({ error: 'Failed to add record' }, { status: 500 });
    }
}
