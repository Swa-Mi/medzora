import { NextResponse } from 'next/server';
import prisma from '@/library/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ success: false, error: 'Missing token.' }, { status: 400 });
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
        return NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 400 });
    }

    await prisma.user.update({
        where: { email: tokenRecord.identifier },
        data: { emailVerified: true },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/hospital/login`);
}
