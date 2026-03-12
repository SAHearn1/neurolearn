import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Parent portal — unauthenticated', () => {
  test('unauthenticated access to /parent redirects to login', async ({ page }) => {
    await page.goto('/parent')
    await expect(page).toHaveURL(/login/)
  })

  test('login page after /parent redirect has correct form elements', async ({ page }) => {
    await page.goto('/parent')
    await expect(page).toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})

// Tests below require authenticated parent credentials
test.describe('Parent portal — authenticated', () => {
  test.skip(
    () => !process.env.E2E_PARENT_EMAIL,
    'Set E2E_PARENT_EMAIL and E2E_PARENT_PASSWORD to run these tests',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_PARENT_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_PARENT_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/parent|dashboard/)
  })

  test('parent dashboard has main landmark and h1', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('parent dashboard shows Students tab', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.getByRole('tab', { name: /student/i })).toBeVisible()
  })

  test('parent dashboard shows Progress tab', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.getByRole('tab', { name: /progress/i })).toBeVisible()
  })

  test('parent dashboard shows Messages tab', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.getByRole('tab', { name: /message/i })).toBeVisible()
  })
})

test.describe('Parent portal — role guard', () => {
  test.skip(
    () => !process.env.E2E_LEARNER_EMAIL,
    'Set E2E_LEARNER_EMAIL and E2E_LEARNER_PASSWORD to run role-guard test',
  )

  test('non-parent role is redirected away from /parent', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_LEARNER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_LEARNER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
    await page.goto('/parent')
    await expect(page).toHaveURL(/dashboard/)
  })
})
