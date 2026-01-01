# Guardian API Documentation

The Guardian Engine provides compliance scanning for content generation workflows. It implements policy-based detection for brand safety, formality consistency, and regulatory compliance.

## Base URL

```
Production: https://guardian.yourdomain.com
Development: http://localhost:3001
```

---

## Endpoints

### POST /api/guardian/scan

Scans content against a specified policy profile and returns compliance status with violations.

**Request Body**

```typescript
{
  "projectId": "instagram-reel-poster",  // Client project identifier
  "content": {
    "text": "Entdecken Sie unser Restaurant in Berlin.",
    "language": "de",
    "context": "promo_script"
  },
  "profileId": "PROMO_SCRIPT_DE_V1",  // Policy pack to apply
  "formalityMode": "strict"           // "strict" | "skip"
}
```

**Response (200 OK)**

```typescript
{
  "status": "APPROVED" | "REJECTED" | "REVIEW_REQUIRED",
  "score": 85,                         // 0-100, higher is better
  "signals": [
    {
      "type": "SIGNAL_AGGRESSIVE_SALES",
      "source": "REGEX",
      "confidence": 0.9,
      "matchedText": "Buy now!"
    }
  ],
  "violations": [
    {
      "ruleId": "RULE_AGGRESSIVE_SALES",
      "category": "MANIPULATION",
      "severity": "HIGH",
      "message": "Aggressive sales language detected."
    }
  ],
  "auditId": "550e8400-e29b-41d4-a716-446655440000",
  "correctionHints": [
    "Soften sales language for German market"
  ],
  "scannedAt": "2024-01-15T10:30:00.000Z",
  "profileUsed": "PROMO_SCRIPT_DE_V1"
}
```

**Status Codes**
- `200` - Scan completed successfully
- `400` - Invalid request body
- `404` - Policy profile not found
- `500` - Internal server error

---

### GET /api/guardian/profiles

Returns available policy profiles for content scanning.

**Response (200 OK)**

```typescript
{
  "profiles": [
    {
      "id": "PROMO_SCRIPT_DE_V1",
      "name": "Promo Script Compliance (German Market)",
      "description": "Brand safety and formality for German B2B/B2C markets",
      "domain": "content_generation",
      "jurisdiction": "DE",
      "detectorCount": 3,
      "ruleCount": 6
    },
    {
      "id": "PROMO_SCRIPT_EU_V1",
      "name": "Promo Script Compliance (EU Market)",
      "description": "Brand safety for EU-wide marketing",
      "domain": "content_generation",
      "jurisdiction": "EU",
      "detectorCount": 2,
      "ruleCount": 4
    }
  ]
}
```

---

### GET /api/guardian/health

Health check endpoint for monitoring.

**Response (200 OK)**

```typescript
{
  "status": "healthy",           // "healthy" | "degraded" | "unhealthy"
  "version": "1.0.0",
  "uptime": 3600,                // seconds
  "profilesLoaded": 6,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Policy Profiles

### PROMO_SCRIPT_DE_V1

German market promotional content compliance.

| Rule ID | Category | Severity | Description |
|---------|----------|----------|-------------|
| `RULE_AGGRESSIVE_SALES` | MANIPULATION | HIGH | Detects "Buy now!", "Limited time!" |
| `RULE_MISLEADING_CLAIM` | TRANSPARENCY | HIGH | Detects "100% guaranteed", "miracle" |
| `RULE_PRESSURE_TACTIC` | MANIPULATION | MEDIUM | Detects "Only X left" scarcity |
| `RULE_FORMALITY_MIXING` | PROFESSIONALISM | MEDIUM | Detects Sie/Du mixing |
| `RULE_INFORMAL_LANGUAGE` | PROFESSIONALISM | LOW | Detects casual slang |
| `RULE_AI_DISCLOSURE_PROMO` | TRANSPARENCY | LOW | Missing AI disclosure |

**Detectors**: BrandSafetyDetector, FormalityConsistencyDetector, TransparencyDetector

### PROMO_SCRIPT_EU_V1

EU-wide promotional content compliance (less strict than DE).

| Rule ID | Category | Severity | Description |
|---------|----------|----------|-------------|
| `RULE_AGGRESSIVE_SALES_EU` | MANIPULATION | MEDIUM | Aggressive sales language |
| `RULE_MISLEADING_CLAIM_EU` | TRANSPARENCY | HIGH | Misleading marketing claims |
| `RULE_PRESSURE_TACTIC_EU` | MANIPULATION | LOW | Pressure sales tactics |
| `RULE_AI_DISCLOSURE_EU` | TRANSPARENCY | LOW | AI disclosure suggestion |

**Detectors**: BrandSafetyDetector, TransparencyDetector

---

## Integration Example

### TypeScript/Node.js

```typescript
import { GuardianClient } from './infrastructure/compliance/GuardianClient';

const guardian = new GuardianClient({
  baseUrl: 'http://localhost:3001',
  projectId: 'my-project'
});

// Check if API is available
if (await guardian.isAvailable()) {
  const result = await guardian.scanScript(
    'Entdecken Sie unser Restaurant in Berlin.',
    'de'
  );
  
  if (!result.approved) {
    console.log('Violations:', result.violations);
    console.log('Hints:', result.correctionHints);
  }
}
```

### cURL

```bash
curl -X POST http://localhost:3001/api/guardian/scan \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test",
    "content": {
      "text": "Buy now! Limited time offer!",
      "language": "en"
    },
    "profileId": "PROMO_SCRIPT_EU_V1",
    "formalityMode": "skip"
  }'
```

---

## Graceful Degradation

When the Guardian API is unavailable, clients should implement graceful degradation:

```typescript
try {
  const result = await guardian.scanScript(script, language);
  // Use result
} catch (error) {
  console.warn('Guardian unavailable, proceeding with warning');
  return {
    approved: true,
    score: 0,
    auditId: 'guardian-unavailable',
    violations: [],
    correctionHints: ['Compliance not verified - Guardian API unavailable']
  };
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GUARDIAN_API_URL` | Base URL for Guardian API | `http://localhost:3001` |
| `GUARDIAN_TIMEOUT_MS` | Request timeout in milliseconds | `10000` |
