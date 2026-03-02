// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import axeCore from 'axe-core'

// Helper to create a minimal DOM container for axe analysis
function createContainer(html: string): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  return container
}

function cleanup(container: HTMLElement) {
  document.body.removeChild(container)
}

async function runAxe(container: HTMLElement) {
  const results = await axeCore.run(container, {
    rules: {
      // Disable rules that don't apply in jsdom
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  })
  return results.violations
}

describe('Accessibility — Static HTML checks', () => {
  it('form with labels has no violations', async () => {
    const container = createContainer(`
      <form>
        <label for="email">Email</label>
        <input id="email" type="email" name="email" />
        <label for="password">Password</label>
        <input id="password" type="password" name="password" />
        <button type="submit">Submit</button>
      </form>
    `)
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
    cleanup(container)
  })

  it('image without alt text is a violation', async () => {
    const container = createContainer('<img src="test.png" />')
    const violations = await runAxe(container)
    const imgAlt = violations.find((v) => v.id === 'image-alt')
    expect(imgAlt).toBeDefined()
    cleanup(container)
  })

  it('button with text has no violations', async () => {
    const container = createContainer('<button>Click me</button>')
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
    cleanup(container)
  })

  it('heading hierarchy is checked', async () => {
    const container = createContainer(`
      <main>
        <h1>Page Title</h1>
        <h2>Section</h2>
        <p>Content</p>
      </main>
    `)
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
    cleanup(container)
  })

  it('input without label is a violation', async () => {
    const container = createContainer('<input type="text" />')
    const violations = await runAxe(container)
    const labelViolation = violations.find((v) => v.id === 'label')
    expect(labelViolation).toBeDefined()
    cleanup(container)
  })
})
