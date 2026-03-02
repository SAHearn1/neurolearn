# Rollback Procedure

## Vercel Deployment Rollback

### Instant Rollback (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → neurolearn project
2. Navigate to **Deployments** tab
3. Find the last known good deployment
4. Click the **...** menu → **Promote to Production**

This is instant and does not require a git revert.

### Git-Based Rollback
```bash
# Identify the last good commit
git log --oneline -10

# Revert the problematic commit(s)
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

## Database Migration Rollback

### Before Running Migrations
1. Always take a Supabase database backup first:
   - Supabase Dashboard → Settings → Database → Backups
   - Or use `pg_dump` for a manual backup

### Rolling Back a Migration
Supabase migrations are forward-only. To reverse:

1. **Create a new migration** that undoes the changes:
```sql
-- Example: 008_rollback_007.sql
DROP TABLE IF EXISTS adaptive_learning_state;
```

2. **Apply the rollback migration:**
```bash
supabase db push
```

### Critical Rules
- **Never** modify a migration that has been deployed to production
- **Always** create a new migration to undo changes
- **Test** rollback migrations in a staging environment first
- **Back up** before any schema changes

## Edge Function Rollback

Edge Functions are deployed independently:
```bash
# Deploy previous version
supabase functions deploy <function-name> --project-ref lwswycdksrmputowfbwu
```

Or revert in git and push to trigger CI/CD.

## Environment Checklist

| Step | Action | Verify |
|------|--------|--------|
| 1 | Identify failing deployment | Vercel dashboard shows Error |
| 2 | Check build logs | Vercel → Deployment → Build Logs |
| 3 | Promote last good deployment | Vercel → Deployments → Promote |
| 4 | If DB issue, check migration logs | Supabase → SQL Editor |
| 5 | Revert commit if needed | `git revert` + push |
| 6 | Verify production is healthy | Visit /health.json |
