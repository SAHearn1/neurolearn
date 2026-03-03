import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Educator portal — unauthenticated', () => {
  test('unauthenticated access to /educator redirects to login', async ({ page }) => {
    await page.goto('/educator')
    await expect(page).toHaveURL(/login/)
  })

  test('login page rendered after /educator redirect has correct form elements', async ({ page }) => {
    await page.goto('/educator')
    await expect(page).toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('unauthenticated access to /admin also redirects to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/)
  })
})

// Tests below require a live Supabase + educator credentials
// Set E2E_EDUCATOR_EMAIL and E2E_EDUCATOR_PASSWORD env vars to enable
test.describe('Educator portal — authenticated', () => {
  test.skip(
    () => !process.env.E2E_EDUCATOR_EMAIL,
    'Set E2E_EDUCATOR_EMAIL and E2E_EDUCATOR_PASSWORD to run these tests',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_EDUCATOR_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_EDUCATOR_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/educator|dashboard/)
  })

  test('educator dashboard has main landmark and h1', async ({ page }) => {
    await page.goto('/educator')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('educator dashboard shows Classes tab', async ({ page }) => {
    await page.goto('/educator')
    await expect(page.getByRole('tab', { name: /class/i })).toBeVisible()
  })

  test('educator dashboard shows Analytics tab', async ({ page }) => {
    await page.goto('/educator')
    await expect(page.getByRole('tab', { name: /analytics/i })).toBeVisible()
  })

  test('educator dashboard shows Content tab', async ({ page }) => {
    await page.goto('/educator')
    await expect(page.getByRole('tab', { name: /content/i })).toBeVisible()
  })

  test('non-educator learner role is redirected away from /educator', async ({ page }) => {
    // This test requires a learner-role test account
    test.skip(!process.env.E2E_LEARNER_EMAIL, 'Set E2E_LEARNER_EMAIL to run role-guard test')
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_LEARNER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_LEARNER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.goto('/educator')
    await expect(page).toHaveURL(/dashboard/)
  })
})
