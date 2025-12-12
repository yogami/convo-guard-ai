import { NextResponse } from 'next/server';
import { aiService } from '@/infrastructure/openai/OpenAIService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        const reply = await aiService.chat(message);

        return NextResponse.json({
            reply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', reply: "I'm having trouble connecting right now." },
            { status: 500 }
        );
    }
}
