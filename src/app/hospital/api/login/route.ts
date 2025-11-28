// File: src/app/hospital/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    if (email === 'admin@hospital.com' && password === 'admin123') {
        return NextResponse.json({ success: true, token: 'fake-jwt-token' });
    }

    return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
    );
}
