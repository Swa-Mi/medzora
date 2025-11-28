import { NextResponse } from 'next/server';
import prisma from '@/library/prisma';
import bcrypt from 'bcryptjs';
import { sendCustomVerificationEmail } from '@/utils/emails';
export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to DB
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Signup failed' }, { status: 500 });
    }
}
