/**
 * GET /api/health
 * Health check endpoint for Railway deployment
 */
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/infrastructure/supabase/SupabaseClient';

export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        services: {
            database: isSupabaseConfigured() ? 'connected' : 'not_configured',
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
        },
    };

    return NextResponse.json(health);
}
