import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Authentication flows', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login shows validation error for invalid email', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/password/i).fill('password')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('signup page has age confirmation checkbox', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel(/13 years/i)).toBeVisible()
  })

  test('signup requires age confirmation', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('TestPass1')
    await page.getByRole('button', { name: /create account/i }).click()
    // Should show age confirmation error
    await expect(page.getByText(/13 or older/i)).toBeVisible()
  })

  test('password reset page loads', async ({ page }) => {
    await page.goto('/password-reset')
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
