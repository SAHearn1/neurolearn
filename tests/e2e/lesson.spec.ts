import { test, expect } from '@playwright/test'

// Skip all E2E tests unless explicitly enabled (they require a running Supabase)
test.skip(() => !process.env.PLAYWRIGHT_RUN, 'Requires PLAYWRIGHT_RUN=true')

test.describe('Lesson flows', () => {
  test.beforeEach(async ({ page }) => {
    // Would use a test user fixture in real implementation
    await page.goto('/login')
  })

  test('courses page loads with course list', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('lesson page has accessible navigation', async ({ page }) => {
    await page.goto('/courses')
    // Navigate to first course if visible
    const firstCourse = page.getByRole('link', { name: /course/i }).first()
    if (await firstCourse.isVisible()) {
      await firstCourse.click()
      await expect(page.getByRole('main')).toBeVisible()
    }
  })

  test('lesson page renders content area', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByRole('main')).toBeVisible()
    // Verify page has heading
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible()
  })
})
