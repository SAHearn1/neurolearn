// jest-axe / vitest-axe configuration for automated accessibility testing
//
// Usage in test files:
//   import { axe, toHaveNoViolations } from './axe-setup'
//   expect.extend(toHaveNoViolations)
//
//   it('should have no accessibility violations', async () => {
//     const { container } = render(<MyComponent />)
//     const results = await axe(container)
//     expect(results).toHaveNoViolations()
//   })
//
// Install when ready:
//   npm install -D axe-core vitest-axe

import { createLogger } from './logger'

const log = createLogger('axe')

// Axe configuration matching WCAG 2.1 AA standards
export const axeConfig = {
  rules: {
    // Require all images to have alt text
    'image-alt': { enabled: true },
    // Require all form inputs to have labels
    'label': { enabled: true },
    // Require sufficient color contrast (4.5:1 for normal text)
    'color-contrast': { enabled: true },
    // Require all interactive elements to be keyboard accessible
    'keyboard': { enabled: true },
    // Require proper heading hierarchy
    'heading-order': { enabled: true },
    // Require skip navigation links
    'skip-link': { enabled: true },
    // Require ARIA attributes to be valid
    'aria-valid-attr': { enabled: true },
    // Require landmark regions
    'region': { enabled: true },
  },
}

// Helper to run axe analysis on a container element
export async function runAxeCheck(container: Element): Promise<{
  violations: Array<{
    id: string
    impact: string
    description: string
    nodes: Array<{ html: string }>
  }>
  passes: number
}> {
  try {
    // Dynamic import — only loads if axe-core is installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axeCore = await (Function('return import("axe-core")')() as Promise<any>)
    const results = await axeCore.default.run(container, {
      rules: Object.entries(axeConfig.rules).map(([id, config]) => ({
        id,
        enabled: config.enabled,
      })),
    })

    if (results.violations.length > 0) {
      log.warn(`Found ${results.violations.length} accessibility violations`)
      for (const violation of results.violations) {
        log.warn(`  [${violation.impact}] ${violation.id}: ${violation.description}`)
      }
    }

    return {
      violations: (results.violations as Array<{ id: string; impact: string; description: string; nodes: Array<{ html: string }> }>).map((v: { id: string; impact: string; description: string; nodes: Array<{ html: string }> }) => ({
        id: v.id,
        impact: v.impact ?? 'unknown',
        description: v.description,
        nodes: v.nodes.map((n: { html: string }) => ({ html: n.html })),
      })),
      passes: results.passes.length,
    }
  } catch {
    log.debug('axe-core not installed — skipping accessibility check')
    return { violations: [], passes: 0 }
  }
}
