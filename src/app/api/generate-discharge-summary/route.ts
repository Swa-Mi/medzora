// /src/app/api/generate-discharge-summary/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectDB } from '@/library/connectDB';
import DischargeSummary from '@/models/DischargeLog';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
    try {
        const { patient, diagnosis } = await req.json();

        await connectDB(); // 🔌 Ensure DB is connected

        const prompt = `
Create a formal medical discharge summary for the following patient:

Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}
Weight: ${patient.weight} kg

Diagnosis / Notes: ${diagnosis}

Include:
- Summary of condition
- Treatments given
- Medication prescribed (if any)
- Follow-up advice
- Final instructions
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        const summary = completion.choices[0].message.content || 'Failed to generate summary.';

        // ✅ Save to MongoDB
        await DischargeSummary.create({
            patientId: patient.id,
            patientName: patient.name,
            summary,
        });

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error('❌ Error generating summary:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
