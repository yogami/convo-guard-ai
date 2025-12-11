# Regulatory Sync Architecture

## Overview
ConvoGuard AI uses a **Dynamic Policy Engine** that connects to external regulatory databases via secure API feeds. We do **not** scrape websites, as this is unreliable and prone to breaking changes.

## Data Source Strategy
1.  **Primary Source**: Official Government APIs (e.g., EUR-Lex API for EU directives, HIPAA Official Feed for US).
2.  **Fallback**: Cached "Gold Standard" policies stored locally (encrypted) to ensure zero-downtime validation even if the external feed is unreachable.
3.  **Real-Time Updates**: The `ExternalPolicyRepository` polls for updates every hour (configurable).

## Architecture
- **Adapter Pattern**: The system uses a strict `PolicyRepository` interface.
- **Provider Agnostic**: The underlying provider can be swapped (e.g., allow clients to plug in their own paid `Compliance.ai` or `Thomson Reuters` feed) without changing the core validation logic.

## Current Implementation (MVP)
The current `ExternalPolicyRepository.ts` simulates this connection for demonstration purposes, injecting real EU AI Act and GDPR articles into the live validation functionality.
