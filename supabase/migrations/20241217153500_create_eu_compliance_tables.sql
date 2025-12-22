-- Transparency logs (EU AI Act Art 50 + Art 12 Record Keeping)
CREATE TABLE transparency_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    system_id VARCHAR(255) NOT NULL,
    decision_type VARCHAR(50) NOT NULL,
    input_summary TEXT,
    output_decision TEXT,
    explanation_provided BOOLEAN DEFAULT FALSE,
    human_oversight BOOLEAN DEFAULT FALSE,
    audit_trail JSONB,
    regulation_references TEXT[]
);

CREATE INDEX idx_transparency_logs_system_id ON transparency_logs(system_id);
CREATE INDEX idx_transparency_logs_created_at ON transparency_logs(created_at);

-- Declarations of Conformity (EU AI Act Art 47)
CREATE TABLE declarations_of_conformity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    system_name VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_address TEXT,
    issue_date DATE NOT NULL,
    doc_json JSONB NOT NULL,
    pdf_url TEXT
);

CREATE INDEX idx_doc_system_name ON declarations_of_conformity(system_name);

-- Incident reports (GPAI systemic risk Art 52-55)
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    system_id VARCHAR(255) NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    corrective_measures TEXT,
    reported_to_ai_office BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_incident_reports_system_id ON incident_reports(system_id);
