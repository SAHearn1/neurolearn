import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NeuroLearn/)
  })

  test('login page accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('signup page accessible', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.getByText(/not found/i)).toBeVisible()
  })

  test('health check endpoint', async ({ request }) => {
    const response = await request.get('/health.json')
    expect(response.ok()).toBeTruthy()
  })
})
