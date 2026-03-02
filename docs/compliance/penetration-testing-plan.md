# Penetration Testing Plan (OWASP Top 10)

## Scope
- **Target**: NeuroLearn web application (https://neurolearn-one.vercel.app)
- **Backend**: Supabase API endpoints + Edge Functions
- **Exclusions**: Supabase infrastructure (managed by Supabase Inc.)

## OWASP Top 10 (2021) Test Matrix

### A01:2021 — Broken Access Control
| Test | Method | Expected Result |
|---|---|---|
| RLS bypass attempt | Direct Supabase API with manipulated JWT | Blocked by RLS |
| Cross-user data access | Modify user_id in API calls | Rejected by RLS |
| Role escalation | Attempt admin actions as learner | 403 Forbidden |
| Parent accessing unlinked student | Query without parent_student_link | Empty result |
| Educator accessing non-enrolled student | Query without class_enrollment | Empty result |
| Unauthenticated access | API calls without JWT | 401 Unauthorized |

### A02:2021 — Cryptographic Failures
| Test | Method | Expected Result |
|---|---|---|
| TLS version check | SSL Labs scan | A+ rating, TLS 1.3 |
| HSTS enforcement | Header inspection | max-age=63072000 |
| Sensitive data in URLs | URL inspection | No tokens/passwords in URLs |
| JWT validation | Expired/tampered JWT | Rejected |

### A03:2021 — Injection
| Test | Method | Expected Result |
|---|---|---|
| SQL injection | Malformed input in forms | Parameterized queries (Supabase) |
| XSS (stored) | Script tags in display_name | HTML-escaped by sanitizeHTML() |
| XSS (reflected) | Script in URL params | CSP blocks inline scripts |
| CSRF | Cross-origin form submission | SameSite cookies + CORS |

### A04:2021 — Insecure Design
| Test | Method | Expected Result |
|---|---|---|
| Rate limiting | Rapid login attempts | Supabase rate limit (30/min) |
| Account enumeration | Email existence check | Generic error messages |
| Password reset abuse | Rapid reset requests | Rate limited |

### A05:2021 — Security Misconfiguration
| Test | Method | Expected Result |
|---|---|---|
| Security headers | Header audit | All 7 headers present |
| Directory listing | Attempt /api/ enumeration | 404 |
| Default credentials | Check for test accounts | None in production |
| Error disclosure | Force errors | Generic error messages |

### A06:2021 — Vulnerable Components
| Test | Method | Expected Result |
|---|---|---|
| npm audit | `npm audit` | No critical vulnerabilities |
| Dependency versions | Check for EOL versions | All supported |
| Supabase version | Dashboard check | Latest stable |

### A07:2021 — Auth Failures
| Test | Method | Expected Result |
|---|---|---|
| Brute force login | Automated login attempts | Rate limited after 30 |
| Weak password | Registration with "123" | Zod validation rejects |
| Session fixation | Reuse pre-auth session | New session on login |
| Token replay | Reuse expired JWT | Rejected |

### A08:2021 — Software/Data Integrity
| Test | Method | Expected Result |
|---|---|---|
| Dependency integrity | Verify package-lock.json | npm ci validates checksums |
| CI pipeline integrity | Review workflow permissions | Minimal permissions |
| Build artifact integrity | Verify Vercel deployment | Immutable deployments |

### A09:2021 — Logging and Monitoring
| Test | Method | Expected Result |
|---|---|---|
| Auth failure logging | Failed login attempts | Logged in audit_log |
| Access logging | Admin actions | Logged with actor_id |
| Log tampering | Attempt to modify audit_log | INSERT-only policy |

### A10:2021 — SSRF
| Test | Method | Expected Result |
|---|---|---|
| Edge Function SSRF | Manipulated URLs in prompts | URL validation in edge functions |
| Avatar URL injection | Malicious avatar_url | CSP img-src restriction |

## Schedule
- **Pre-launch**: Full OWASP test suite before first school deployment
- **Quarterly**: Automated vulnerability scanning (npm audit, SSL Labs)
- **Annually**: Third-party penetration test with report
- **On-demand**: After any security incident or major feature release

## Tools
- Burp Suite (manual testing)
- OWASP ZAP (automated scanning)
- SSL Labs (TLS analysis)
- npm audit (dependency scanning)
- Lighthouse (security headers)
