import { NextResponse } from 'next/server';
import { sendCustomVerificationEmail } from '@/utils/emails';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await sendCustomVerificationEmail(email);

        return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
    } catch (error) {
        console.error('❌ Error resending verification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
