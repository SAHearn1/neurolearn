const OPENDYSLEXIC_CDN =
  'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css'

let linkElement: HTMLLinkElement | null = null

export function enableDyslexiaFont(): void {
  if (linkElement) return

  linkElement = document.createElement('link')
  linkElement.rel = 'stylesheet'
  linkElement.href = OPENDYSLEXIC_CDN
  linkElement.id = 'neurolearn-dyslexia-font'
  document.head.appendChild(linkElement)

  document.documentElement.style.setProperty('--font-family-base', "'OpenDyslexic', sans-serif")
  document.documentElement.classList.add('dyslexia-font')
}

export function disableDyslexiaFont(): void {
  if (linkElement) {
    linkElement.remove()
    linkElement = null
  }
  document.documentElement.style.removeProperty('--font-family-base')
  document.documentElement.classList.remove('dyslexia-font')
}

export function isDyslexiaFontEnabled(): boolean {
  return document.documentElement.classList.contains('dyslexia-font')
}
