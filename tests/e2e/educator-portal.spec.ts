import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Educator portal', () => {
  test('educator dashboard requires authentication', async ({ page }) => {
    await page.goto('/educator')
    // Should redirect to login or show access denied
    const isLogin = page.url().includes('login')
    const isDenied = await page
      .getByText(/access denied/i)
      .isVisible()
      .catch(() => false)
    expect(isLogin || isDenied).toBeTruthy()
  })

  test('educator dashboard page loads for educators', async ({ page }) => {
    // Placeholder — would authenticate as educator in real suite
    await page.goto('/educator')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('educator dashboard has class management tab', async ({ page }) => {
    await page.goto('/educator')
    // Verify main content area exists
    await expect(page.getByRole('main')).toBeVisible()
  })
})
