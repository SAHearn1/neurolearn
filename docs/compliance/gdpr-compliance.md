# GDPR Compliance Plan

## General Data Protection Regulation (EU 2016/679)

### Applicability
GDPR applies when NeuroLearn processes personal data of individuals in the European Economic Area (EEA), regardless of where NeuroLearn is hosted.

### Lawful Basis for Processing

| Processing Activity | Lawful Basis | Details |
|---|---|---|
| Account registration | Consent (Art. 6(1)(a)) | Explicit consent at signup |
| Learning progress tracking | Contract (Art. 6(1)(b)) | Necessary for service delivery |
| Accessibility accommodations | Legitimate interest (Art. 6(1)(f)) | Educational accommodation |
| RACA cognitive sessions | Consent (Art. 6(1)(a)) | Explicit opt-in via feature flag |
| AI agent interactions | Consent (Art. 6(1)(a)) | User initiates each interaction |
| Analytics | Legitimate interest (Art. 6(1)(f)) | Platform improvement |
| Security logging | Legal obligation (Art. 6(1)(c)) | Breach detection |

### Data Subject Rights Implementation

| Right | Implementation | Endpoint |
|---|---|---|
| **Access** (Art. 15) | Profile page + CSV export | /profile, /api/data-export |
| **Rectification** (Art. 16) | Edit profile page | /profile |
| **Erasure** (Art. 17) | Account deletion via settings | /settings → Delete Account |
| **Restriction** (Art. 18) | Account deactivation | Admin dashboard |
| **Portability** (Art. 20) | JSON/CSV data export | /api/data-export |
| **Object** (Art. 21) | Opt-out of analytics | /settings → Privacy |
| **Automated decisions** (Art. 22) | RACA is advisory only, no automated decisions affect access | N/A |

### Data Processing Agreements

| Processor | Purpose | DPA Status | Data Location |
|---|---|---|---|
| Supabase | Database, Auth, Edge Functions | Required before production | AWS us-east-1 |
| Vercel | Hosting, CDN | Standard DPA | Global edge |
| Anthropic | AI agent responses | Required — no PII in prompts | US |

### Data Protection Impact Assessment (DPIA)
A DPIA is required because NeuroLearn processes:
- Children's data (special category under GDPR)
- Learning/behavioral data (potentially sensitive)
- Cognitive profiling (RACA epistemic monitoring)

### Technical Measures (Art. 32)
1. **Encryption**: TLS 1.3 in transit, AES-256 at rest (Supabase managed)
2. **Access control**: RLS policies, RBAC with 4 roles, JWT authentication
3. **Pseudonymization**: UUIDs for all record IDs, no direct identifiers in AI prompts
4. **Audit trail**: Immutable audit_log table with actor, action, timestamp
5. **Breach detection**: Security headers, rate limiting, anomaly monitoring

### Data Retention Schedule
| Data Type | Retention Period | After Expiry |
|---|---|---|
| Active user data | Duration of account | N/A |
| Deleted user data | 30 days (grace period) | Permanently deleted |
| Audit logs | 7 years | Anonymized |
| AI interaction logs | 1 year | Deleted |
| Session data | 90 days after completion | Deleted |

### Cross-Border Transfer
- Primary storage in Supabase (AWS us-east-1, USA)
- Standard Contractual Clauses (SCCs) required for EU→US transfer
- No data stored in jurisdictions without adequacy decisions beyond above

### Data Protection Officer
- Designated DPO contact: privacy@neurolearn.app
- DPO reviews all new features involving personal data
- Annual compliance review and reporting
