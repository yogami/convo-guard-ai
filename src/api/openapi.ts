/**
 * OpenAPI Schema Definitions for ConvoGuard AI
 * 
 * Uses Zod schemas linked to domain entities for type-safe API contracts.
 * This file is the source of truth for the /api/openapi.json manifest.
 * 
 * @module api/openapi
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

export const ContentPayloadSchema = z.object({
    text: z.string().min(1).describe('Primary text content to scan'),
    imageUrls: z.array(z.string().url()).optional().describe('Optional image URLs for visual scanning'),
    audioTranscript: z.string().optional().describe('Optional audio transcript'),
    language: z.string().optional().default('en').describe('Language code (e.g., "de", "en")')
});

export const GuardianScanRequestSchema = z.object({
    projectId: z.string().min(1).describe('Project identifier (e.g., "instagram-reel-poster")'),
    content: ContentPayloadSchema,
    profileId: z.string().min(1).describe('Policy profile ID (e.g., "PROMO_SCRIPT_DE_V1")'),
    skipDetectors: z.array(z.string()).optional().describe('Optional: Skip specific detectors'),
    formalityMode: z.enum(['strict', 'lenient', 'skip']).optional().describe('Override formality check mode')
});

// ============================================================================
// Response Schemas
// ============================================================================

export const SignalSchema = z.object({
    type: z.string(),
    confidence: z.number().min(0).max(1),
    context: z.string().optional(),
    detectorId: z.string()
});

export const PolicyViolationSchema = z.object({
    ruleId: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    message: z.string(),
    category: z.string()
});

export const GuardianScanResponseSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'REVIEW_REQUIRED']).describe('Final verdict'),
    score: z.number().min(0).max(100).describe('Compliance score'),
    signals: z.array(SignalSchema).describe('Detected signals from detectors'),
    violations: z.array(PolicyViolationSchema).describe('Policy violations triggered'),
    auditId: z.string().uuid().describe('Unique audit trail identifier'),
    correctionHints: z.array(z.string()).describe('Actionable suggestions'),
    scannedAt: z.string().datetime().describe('Processing timestamp'),
    profileUsed: z.string().describe('Profile used for scanning')
});

export const ErrorResponseSchema = z.object({
    error: z.string().describe('Error message')
});

// ============================================================================
// Profile Schema
// ============================================================================

export const ComplianceProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    domain: z.string(),
    jurisdiction: z.string(),
    detectorCount: z.number(),
    ruleCount: z.number()
});

export const ProfileListResponseSchema = z.object({
    profiles: z.array(ComplianceProfileSchema)
});

// ============================================================================
// Health Check Schema
// ============================================================================

export const HealthResponseSchema = z.object({
    status: z.enum(['ok', 'degraded', 'error']),
    version: z.string(),
    timestamp: z.string().datetime()
});

// ============================================================================
// OpenAPI Spec Generator
// ============================================================================

export function generateOpenAPISpec(): Record<string, unknown> {
    return {
        openapi: '3.0.3',
        info: {
            title: 'ConvoGuard AI API',
            version: '1.0.0',
            description: 'Real-time compliance scanning and policy evaluation API for AI-generated content.'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local development' },
            { url: 'https://convo-guard.railway.app', description: 'Production' }
        ],
        paths: {
            '/api/guardian/scan': {
                post: {
                    summary: 'Scan content for compliance',
                    description: 'Evaluates content against the specified policy profile and returns compliance status.',
                    operationId: 'scanContent',
                    tags: ['Guardian'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: zodToJsonSchema(GuardianScanRequestSchema)
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Scan completed successfully',
                            content: {
                                'application/json': {
                                    schema: zodToJsonSchema(GuardianScanResponseSchema)
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid request',
                            content: {
                                'application/json': {
                                    schema: zodToJsonSchema(ErrorResponseSchema)
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: zodToJsonSchema(ErrorResponseSchema)
                                }
                            }
                        }
                    }
                }
            },
            '/api/guardian/health': {
                get: {
                    summary: 'Health check',
                    description: 'Returns API health status and version.',
                    operationId: 'getHealth',
                    tags: ['Guardian'],
                    responses: {
                        '200': {
                            description: 'API is healthy',
                            content: {
                                'application/json': {
                                    schema: zodToJsonSchema(HealthResponseSchema)
                                }
                            }
                        }
                    }
                }
            },
            '/api/guardian/profiles': {
                get: {
                    summary: 'List compliance profiles',
                    description: 'Returns all available policy profiles for scanning.',
                    operationId: 'listProfiles',
                    tags: ['Guardian'],
                    responses: {
                        '200': {
                            description: 'List of profiles',
                            content: {
                                'application/json': {
                                    schema: zodToJsonSchema(ProfileListResponseSchema)
                                }
                            }
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                ContentPayload: zodToJsonSchema(ContentPayloadSchema),
                GuardianScanRequest: zodToJsonSchema(GuardianScanRequestSchema),
                GuardianScanResponse: zodToJsonSchema(GuardianScanResponseSchema),
                ComplianceProfile: zodToJsonSchema(ComplianceProfileSchema),
                HealthResponse: zodToJsonSchema(HealthResponseSchema),
                ErrorResponse: zodToJsonSchema(ErrorResponseSchema)
            }
        }
    };
}

/**
 * Simple Zod to JSON Schema converter
 * Uses a type-safe approach without accessing internal Zod properties.
 * For production, consider using the zod-to-json-schema library.
 */
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
    // Use safeParse to detect type by behavior rather than internal properties
    const testObj = { test: 'value', num: 42, bool: true, arr: [] };

    // Check if it's an object schema by testing shape property
    if ('shape' in schema && typeof schema.shape === 'object') {
        const shape = schema.shape as Record<string, z.ZodTypeAny>;
        const properties: Record<string, unknown> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodToJsonSchema(value);
            if (!value.isOptional()) {
                required.push(key);
            }
        }

        return { type: 'object', properties, required: required.length > 0 ? required : undefined };
    }

    // Check for array by testing element property
    if ('element' in schema) {
        const elementSchema = (schema as { element: z.ZodTypeAny }).element;
        return { type: 'array', items: zodToJsonSchema(elementSchema) };
    }

    // Check for enum by testing options property
    if ('options' in schema && Array.isArray((schema as { options: unknown[] }).options)) {
        return { type: 'string', enum: (schema as { options: string[] }).options };
    }

    // Check for optional by testing unwrap method
    if ('unwrap' in schema && typeof (schema as { unwrap: () => z.ZodTypeAny }).unwrap === 'function') {
        return zodToJsonSchema((schema as { unwrap: () => z.ZodTypeAny }).unwrap());
    }

    // Test basic types using safeParse behavior
    const stringTest = schema.safeParse('test');
    const numberTest = schema.safeParse(42);
    const boolTest = schema.safeParse(true);

    if (stringTest.success && !numberTest.success && !boolTest.success) {
        return { type: 'string' };
    }
    if (numberTest.success && !boolTest.success) {
        return { type: 'number' };
    }
    if (boolTest.success && !stringTest.success && !numberTest.success) {
        return { type: 'boolean' };
    }

    return { type: 'string' }; // Fallback
}

