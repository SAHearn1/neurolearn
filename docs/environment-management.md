# Environment Management

## Environments

| Environment | URL | Branch | Purpose |
|---|---|---|---|
| **Development** | `http://localhost:5173` | Any | Local development |
| **Preview** | `*.vercel.app` (auto) | PR branches | PR review, integration testing |
| **Staging** | Set via Vercel env | `staging` | Pre-production validation |
| **Production** | `neurolearn-one.vercel.app` | `main` | Live users |

## Environment Variables by Environment

| Variable | Development | Preview | Staging | Production |
|---|---|---|---|---|
| `VITE_APP_ENV` | development | preview | staging | production |
| `VITE_APP_URL` | localhost:5173 | Auto (Vercel) | Staging URL | Production URL |
| `VITE_SUPABASE_URL` | Local Supabase | Dev project | Staging project | Prod project |
| `VITE_SUPABASE_ANON_KEY` | Local key | Dev key | Staging key | Prod key |
| `VITE_RACA_ENABLE_*` | true (all) | true (all) | true (all) | Per-flag rollout |
| `VITE_SENTRY_DSN` | (empty) | Dev DSN | Staging DSN | Prod DSN |
| `VITE_LOG_LEVEL` | debug | info | info | warn |

## Vercel Configuration

### Branch Deployment Rules
1. **main** → Production deployment
2. **staging** → Staging deployment (set domain alias in Vercel)
3. **feat/***, **fix/*** → Preview deployments (auto-generated URL)

### Environment Variable Scoping (Vercel Dashboard)
- Production variables: only applied to production deployments
- Preview variables: applied to all non-production deployments
- Development variables: available via `vercel env pull`

## Database Environments

| Environment | Supabase Project | Data |
|---|---|---|
| Development | Local (supabase start) | Seed data |
| Preview/Staging | neurolearn-staging | Test data (refreshed weekly) |
| Production | neurolearn-prod | Real user data |

## Deployment Flow

```
Developer → Feature Branch → PR (Preview Deploy)
                              ↓ Review + CI pass
                           Merge to main → Production Deploy
                              ↓ (optional)
                           Cherry-pick to staging → Staging Deploy
```

## Rollback
See `docs/rollback-procedure.md` for Vercel and database rollback steps.
