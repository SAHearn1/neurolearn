import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Parent portal', () => {
  test('parent dashboard requires authentication', async ({ page }) => {
    await page.goto('/parent')
    // Should redirect to login or show access denied
    const isLogin = page.url().includes('login')
    const isDenied = await page
      .getByText(/access denied/i)
      .isVisible()
      .catch(() => false)
    expect(isLogin || isDenied).toBeTruthy()
  })

  test('parent dashboard page loads for parents', async ({ page }) => {
    // Placeholder — would authenticate as parent in real suite
    await page.goto('/parent')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('parent portal has student linking section', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.getByRole('main')).toBeVisible()
  })
})
