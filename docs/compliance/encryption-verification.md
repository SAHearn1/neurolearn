# Data Encryption Verification

## Encryption at Rest

### Database (Supabase / PostgreSQL)

- **Provider**: Supabase managed PostgreSQL on AWS
- **Encryption**: AES-256 via AWS RDS encryption
- **Key management**: AWS KMS (managed by Supabase)
- **Scope**: All database files, backups, snapshots, and replicas
- **Verification**: Supabase project settings → Database → Encryption status

### File Storage (Supabase Storage)

- **Encryption**: AES-256 via AWS S3 server-side encryption (SSE-S3)
- **Scope**: All uploaded files (avatars, lesson assets)
- **Verification**: Supabase Storage settings → Encryption

### Client-Side Storage

- **localStorage**: Not encrypted (accessibility preferences only — no PII)
- **Session tokens**: JWT with HMAC-SHA256 signature, expiry-enforced
- **Mitigation**: No sensitive PII stored client-side

## Encryption in Transit

### HTTPS/TLS

- **Protocol**: TLS 1.3 (minimum TLS 1.2)
- **Certificate**: Managed by Vercel (Let's Encrypt / DigiCert)
- **HSTS**: `max-age=63072000; includeSubDomains; preload` (configured in vercel.json)
- **Verification**: `curl -vI https://neurolearn-one.vercel.app 2>&1 | grep TLS`

### Supabase API

- **Protocol**: TLS 1.3 to `*.supabase.co`
- **Authentication**: JWT Bearer token in Authorization header
- **API key**: Anon key (safe for client) + Service role key (server-only)

### Anthropic API (Edge Functions)

- **Protocol**: TLS 1.3 to `api.anthropic.com`
- **Authentication**: API key in `x-api-key` header (stored as Supabase secret)
- **Data sent**: Session context only, no PII

### WebSocket (Supabase Realtime)

- **Protocol**: WSS (WebSocket Secure) over TLS
- **Authentication**: JWT token on connection
- **Scope**: Real-time notifications and messaging

## Password Security

- **Hashing**: bcrypt with cost factor 10 (Supabase Auth default)
- **Storage**: Only bcrypt hash stored; plaintext never persisted
- **Policy**: Minimum 8 chars, uppercase, lowercase, number (enforced by Zod schema)
- **Reset**: Token-based reset via email with 1-hour expiry

## Verification Checklist

| Component                 | Encryption        | Protocol | Verified             |
| ------------------------- | ----------------- | -------- | -------------------- |
| Database at rest          | AES-256 (AWS KMS) | N/A      | Supabase managed     |
| Storage at rest           | AES-256 (SSE-S3)  | N/A      | Supabase managed     |
| App → Supabase            | TLS 1.3           | HTTPS    | HSTS header verified |
| App → User                | TLS 1.3           | HTTPS    | HSTS header verified |
| Edge Function → Anthropic | TLS 1.3           | HTTPS    | API config           |
| Realtime                  | TLS 1.3           | WSS      | Supabase managed     |
| Passwords                 | bcrypt            | N/A      | Supabase Auth        |
| JWTs                      | HMAC-SHA256       | N/A      | Supabase Auth        |
