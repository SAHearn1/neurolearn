import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { useContentSettings } from '../../hooks/useContentSettings'
import { useSettingsStore } from '../../store/settingsStore'
import { InlineCheck } from './InlineCheck'
import { GlossaryTerm } from './GlossaryTerm'

interface RichContentPanelProps {
  content: string
  glossary?: Record<string, string> | null
}

interface CheckBlock {
  type: 'check'
  question: string
  options: { key: string; text: string }[]
  correctKey: string
  explanation: string
}

interface HtmlBlock {
  type: 'html'
  content: string
}

type ContentBlock = CheckBlock | HtmlBlock

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const checkRe = /\[CHECK\]([\s\S]*?)\[\/CHECK\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = checkRe.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'html', content: raw.slice(lastIndex, match.index) })
    }

    const inner = match[1]
    const questionMatch = inner.match(/question:\s*(.+)/)
    const correctMatch = inner.match(/correct:\s*(\w+)/)
    const explanationMatch = inner.match(/explanation:\s*(.+)/)
    const optionMatches = [...inner.matchAll(/^([a-z]):\s*(.+)/gm)]

    if (questionMatch && correctMatch && optionMatches.length > 0) {
      blocks.push({
        type: 'check',
        question: questionMatch[1].trim(),
        options: optionMatches.map((m) => ({ key: m[1], text: m[2].trim() })),
        correctKey: correctMatch[1].trim(),
        explanation: explanationMatch ? explanationMatch[1].trim() : '',
      })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < raw.length) {
    blocks.push({ type: 'html', content: raw.slice(lastIndex) })
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'html', content: raw })
  }

  return blocks
}

// Split an HTML string on ==term== patterns and return mixed React content
function renderWithGlossary(
  html: string,
  glossary: Record<string, string>,
  proseClass: string,
): React.ReactNode {
  const terms = Object.keys(glossary)
  if (terms.length === 0) {
    const clean = DOMPurify.sanitize(html)
    return (
      <div
        className={`prose ${proseClass} max-w-none [&_strong]:rounded [&_strong]:bg-brand-100 [&_strong]:px-0.5`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    )
  }

  const pattern = new RegExp(
    `==(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})==`,
    'g',
  )
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let idx = 0

  while ((m = pattern.exec(html)) !== null) {
    if (m.index > last) {
      const clean = DOMPurify.sanitize(html.slice(last, m.index))
      parts.push(
        <span
          key={`html-${idx++}`}
          className={`prose ${proseClass} max-w-none [&_strong]:rounded [&_strong]:bg-brand-100 [&_strong]:px-0.5`}
          dangerouslySetInnerHTML={{ __html: clean }}
        />,
      )
    }
    const term = m[1]
    parts.push(
      <GlossaryTerm key={`gloss-${idx++}`} term={term} definition={glossary[term] ?? ''}>
        {term}
      </GlossaryTerm>,
    )
    last = m.index + m[0].length
  }

  if (last < html.length) {
    const clean = DOMPurify.sanitize(html.slice(last))
    parts.push(
      <span
        key={`html-${idx++}`}
        className={`prose ${proseClass} max-w-none [&_strong]:rounded [&_strong]:bg-brand-100 [&_strong]:px-0.5`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />,
    )
  }

  return <div className={`prose ${proseClass} max-w-none`}>{parts}</div>
}

export function RichContentPanel({ content, glossary }: RichContentPanelProps) {
  const { proseClass, wrapperClass, fontClass } = useContentSettings()
  const screenReaderHints = useSettingsStore((s) => s.accessibility.screen_reader_hints)

  const blocks = useMemo(() => parseContent(content), [content])

  return (
    <div className={`${wrapperClass} ${fontClass} rounded-lg`}>
      {screenReaderHints && (
        <p className="sr-only" aria-live="polite">
          Lesson content loaded. Use headings to navigate sections.
        </p>
      )}
      {blocks.map((block, i) => {
        if (block.type === 'check') {
          return (
            <InlineCheck
              key={i}
              question={block.question}
              options={block.options}
              correctKey={block.correctKey}
              explanation={block.explanation}
            />
          )
        }
        if (glossary && Object.keys(glossary).length > 0) {
          return <span key={i}>{renderWithGlossary(block.content, glossary, proseClass)}</span>
        }
        const clean = DOMPurify.sanitize(block.content)
        return (
          <div
            key={i}
            className={`prose ${proseClass} max-w-none [&_strong]:rounded [&_strong]:bg-brand-100 [&_strong]:px-0.5`}
            dangerouslySetInnerHTML={{ __html: clean }}
          />
        )
      })}
    </div>
  )
}
