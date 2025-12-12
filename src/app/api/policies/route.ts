import { NextResponse } from 'next/server';
import { policyRepository } from '@/infrastructure/repositories/ExternalPolicyRepository';

export async function GET() {
    try {
        const policies = await policyRepository.getAllPolicies();
        return NextResponse.json({ policies });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, enabled } = await request.json();

        if (typeof id !== 'string' || typeof enabled !== 'boolean') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        await policyRepository.togglePolicy(id, enabled);
        return NextResponse.json({ success: true, id, enabled });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
    }
}
