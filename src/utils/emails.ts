// src/utils/email.ts
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import prisma from '@/library/prisma';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendCustomVerificationEmail(email: string) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
    });

    const confirmURL = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
    console.log(`🔗 Dev verification link: ${confirmURL}`); // Remove later
    console.log('Sending email via Resend to', email);


    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Verify your MedZora Email",
        html: `<p>Click <a href="${confirmURL}">here</a> to verify your email.</p>`,
    });
}
