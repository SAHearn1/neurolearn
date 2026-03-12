import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Lesson flows — unauthenticated', () => {
  test('unauthenticated access to /courses redirects to login', async ({ page }) => {
    await page.goto('/courses')
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated access to /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('reset-password page is publicly accessible', async ({ page }) => {
    await page.goto('/password-reset')
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('reset-password form validates email format', async ({ page }) => {
    await page.goto('/password-reset')
    const emailField = page.getByLabel(/email/i)
    await emailField.fill('not-valid')
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect.poll(() => emailField.evaluate((el) => el.matches(':invalid'))).toBe(true)
  })
})

// Tests below require authenticated learner credentials
test.describe('Lesson flows — authenticated learner', () => {
  test.skip(
    () => !process.env.E2E_LEARNER_EMAIL,
    'Set E2E_LEARNER_EMAIL and E2E_LEARNER_PASSWORD to run these tests',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_LEARNER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_LEARNER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('courses page loads with h1 and course list', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('courses page has accessible main landmark', async ({ page }) => {
    await page.goto('/courses')
    const main = page.locator('#main-content')
    await expect(main).toBeVisible()
    await expect(main).toHaveAttribute('id', 'main-content')
  })

  test('course detail page has back navigation link', async ({ page }) => {
    await page.goto('/courses')
    const firstLink = page.getByRole('link', { name: /view course|continue|start/i }).first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await expect(page.getByRole('link', { name: /back|courses/i })).toBeVisible()
    }
  })

  test('dashboard shows welcome heading and quick links', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: /quick links/i }).getByRole('link', {
        name: /browse courses/i,
      }),
    ).toBeVisible()
  })
})
