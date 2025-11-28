// /app/api/diagnostic/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
    const { symptoms } = await req.json();

    const prompt = `
You are a senior medical AI assistant. Based on the following symptoms and details, give a list of:
1. Likely diagnoses (ranked)
2. Suggested tests to confirm
3. Urgency level
4. General treatment direction

Symptoms:
${symptoms}
`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
}
