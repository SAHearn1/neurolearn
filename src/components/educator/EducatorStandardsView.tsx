// CCSS-02: Educator Standards Evidence View
// Heatmap grid of CCSS standards evidence for a single student

import { useState } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { useCcssStandards } from '../../hooks/useCcssStandards'
import { useCcssExport } from '../../hooks/useCcssExport'
import { Spinner } from '../ui/Spinner'
import { ArtifactEvidenceDrawer } from '../raca/ArtifactEvidenceDrawer'

interface Props {
  studentId: string
  studentName: string
}

type StrandFilter = 'All' | 'ELA' | 'Math'

const MASTERY_COLORS: Record<string, string> = {
  emerging: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  developing: 'bg-orange-100 text-orange-800 border-orange-200',
  proficient: 'bg-green-100 text-green-800 border-green-200',
  advanced: 'bg-blue-100 text-blue-800 border-blue-200',
}

const MASTERY_LABELS: Record<string, string> = {
  emerging: 'Emerging',
  developing: 'Developing',
  proficient: 'Proficient',
  advanced: 'Advanced',
}

const GRADES = ['3', '4', '5', '6', '7', '8']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EducatorStandardsView({ studentId, studentName }: Props) {
  const { evidence, loading, byStrand } = useCcssStandards(studentId)
  const { exportPdf, exporting } = useCcssExport(studentId, studentName)
  const [strandFilter, setStrandFilter] = useState<StrandFilter>('All')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [drawerSessionId, setDrawerSessionId] = useState<string | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)

  const openEvidenceDrawer = async (standardCode: string) => {
    setLoadingSession(true)
    try {
      // Find the most recent session that produced evidence for this standard
      const { data } = await supabase
        .from('skill_evidence_events')
        .select('session_id')
        .eq('user_id', studentId)
        .not('session_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!data?.length) return

      // Join with skill_to_ccss_map to filter by standard code
      const sessionIds = [...new Set(data.map((r: { session_id: string }) => r.session_id))]
      const { data: mappingData } = await supabase
        .from('skill_to_ccss_map')
        .select('skill_code')
        .eq('ccss_standard_code', standardCode)

      if (!mappingData?.length) {
        // Fall back to most recent session
        setDrawerSessionId(sessionIds[0])
        return
      }

      const skillCodes = mappingData.map((m: { skill_code: string }) => m.skill_code)
      const { data: evidenceData } = await supabase
        .from('skill_evidence_events')
        .select('session_id')
        .eq('user_id', studentId)
        .in('skill_code', skillCodes)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setDrawerSessionId(evidenceData?.session_id ?? sessionIds[0])
    } finally {
      setLoadingSession(false)
    }
  }

  if (loading) return <Spinner />

  const filtered =
    strandFilter === 'All' ? evidence : strandFilter === 'ELA' ? byStrand.ELA : byStrand.Math

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-500">
          No standards evidence yet — complete a learning session to see progress.
        </p>
      </div>
    )
  }

  // Collect unique domains for rows
  const domains = [...new Set(filtered.map((e) => e.domain))].sort()

  // Build lookup: domain + grade → evidence
  const lookup = new Map(filtered.map((e) => [`${e.domain}|${e.grade}`, e]))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Standards Evidence</h3>
          <p className="text-xs text-slate-500">{studentName}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Strand filter pills */}
          {(['All', 'ELA', 'Math'] as StrandFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStrandFilter(s)}
              aria-pressed={strandFilter === s}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                strandFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}

          <button
            onClick={exportPdf}
            disabled={exporting}
            aria-label="Export standards report to PDF"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full text-xs"
          role="grid"
          aria-label="CCSS standards evidence heatmap"
        >
          <thead>
            <tr>
              <th className="py-2 pr-4 text-left font-semibold text-slate-600" scope="col">
                Domain
              </th>
              {GRADES.map((g) => (
                <th
                  key={g}
                  className="px-2 py-2 text-center font-semibold text-slate-600"
                  scope="col"
                >
                  Grade {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr key={domain}>
                <td className="py-1.5 pr-4 font-medium text-slate-700 whitespace-nowrap">
                  {domain}
                </td>
                {GRADES.map((grade) => {
                  const ev = lookup.get(`${domain}|${grade}`)
                  if (!ev) {
                    return (
                      <td key={grade} className="px-2 py-1.5 text-center">
                        <span className="inline-block h-6 w-14 rounded border border-slate-100 bg-slate-50" />
                      </td>
                    )
                  }

                  const isExpanded = expandedCode === ev.standardCode

                  return (
                    <td key={grade} className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => setExpandedCode(isExpanded ? null : ev.standardCode)}
                        aria-label={`${ev.standardCode} — ${MASTERY_LABELS[ev.masteryLevel]} mastery. Click to expand details.`}
                        aria-expanded={isExpanded}
                        className={`inline-block rounded border px-2 py-1 transition-all ${MASTERY_COLORS[ev.masteryLevel]} hover:opacity-80`}
                      >
                        {MASTERY_LABELS[ev.masteryLevel].slice(0, 3)}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down panel */}
      {expandedCode &&
        (() => {
          const ev = filtered.find((e) => e.standardCode === expandedCode)
          if (!ev) return null
          return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-slate-500">{ev.standardCode}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{ev.description}</p>
                </div>
                <button
                  onClick={() => setExpandedCode(null)}
                  aria-label="Close details panel"
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Mastery</dt>
                  <dd
                    className={`mt-0.5 font-semibold capitalize rounded px-1.5 py-0.5 inline-block ${MASTERY_COLORS[ev.masteryLevel]}`}
                  >
                    {ev.masteryLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Evidence count</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{ev.evidenceCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Confidence</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">
                    {Math.round(ev.totalConfidence * 100)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last evidenced</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">
                    {formatDate(ev.lastEvidencedAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => void openEvidenceDrawer(ev.standardCode)}
                  disabled={loadingSession}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label={`View session artifacts for ${ev.standardCode}`}
                >
                  {loadingSession ? 'Loading…' : 'View session evidence'}
                </button>
              </div>
            </div>
          )
        })()}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(MASTERY_LABELS).map(([key, label]) => (
          <span key={key} className={`rounded border px-2 py-0.5 ${MASTERY_COLORS[key]}`}>
            {label}
          </span>
        ))}
        <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-slate-400">
          No evidence
        </span>
      </div>

      {/* Artifact Evidence Drawer (#338/#339) */}
      {drawerSessionId && (
        <ArtifactEvidenceDrawer
          isOpen={true}
          studentId={studentId}
          sessionId={drawerSessionId}
          studentName={studentName}
          onClose={() => setDrawerSessionId(null)}
        />
      )}
    </div>
  )
}
