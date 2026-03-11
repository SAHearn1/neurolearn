// CCSS-03: Class-level CCSS Standards Progress Report
// Aggregates student_ccss_evidence across all enrolled students
// Issue #331

import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Spinner } from '../ui/Spinner'

interface Props {
  studentIds: string[]
  studentNames: Record<string, string>
}

type StrandFilter = 'All' | 'ELA' | 'Math'

interface StandardSummary {
  standardCode: string
  strand: 'ELA' | 'Math'
  grade: string
  domain: string
  description: string
  studentCount: number // students with any evidence
  emerging: number
  developing: number
  proficient: number
  advanced: number
}

interface EvidenceRow {
  user_id: string
  ccss_standard_code: string
  mastery_level: string
  ccss_standards:
    | { strand: string; grade: string; domain: string; description: string }
    | { strand: string; grade: string; domain: string; description: string }[]
    | null
}

const MASTERY_COLORS: Record<string, string> = {
  emerging: 'bg-yellow-400',
  developing: 'bg-orange-400',
  proficient: 'bg-green-500',
  advanced: 'bg-blue-500',
}

function MasteryBar({
  total,
  emerging,
  developing,
  proficient,
  advanced,
}: {
  total: number
  emerging: number
  developing: number
  proficient: number
  advanced: number
}) {
  if (total === 0) return <span className="text-xs text-slate-400">—</span>
  const pct = (n: number) => Math.round((n / total) * 100)
  const segments = [
    { key: 'emerging', value: emerging, color: MASTERY_COLORS.emerging },
    { key: 'developing', value: developing, color: MASTERY_COLORS.developing },
    { key: 'proficient', value: proficient, color: MASTERY_COLORS.proficient },
    { key: 'advanced', value: advanced, color: MASTERY_COLORS.advanced },
  ].filter((s) => s.value > 0)

  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      role="img"
      aria-label={`Mastery distribution: ${pct(emerging)}% emerging, ${pct(developing)}% developing, ${pct(proficient)}% proficient, ${pct(advanced)}% advanced`}
    >
      {segments.map((s) => (
        <div
          key={s.key}
          className={`h-full ${s.color} transition-all duration-500`}
          style={{ width: `${pct(s.value)}%` }}
        />
      ))}
    </div>
  )
}

export function ClassCcssReport({ studentIds }: Props) {
  const [summaries, setSummaries] = useState<StandardSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [strandFilter, setStrandFilter] = useState<StrandFilter>('All')
  const [gradeFilter, setGradeFilter] = useState<string>('All')

  const totalStudents = studentIds.length

  useEffect(() => {
    if (studentIds.length === 0) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('student_ccss_evidence')
        .select(
          `
          user_id,
          ccss_standard_code,
          mastery_level,
          ccss_standards (
            strand,
            grade,
            domain,
            description
          )
        `,
        )
        .in('user_id', studentIds)

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      // Aggregate per standard
      const standardMap = new Map<
        string,
        {
          meta: { strand: string; grade: string; domain: string; description: string }
          students: Map<string, string> // userId → mastery_level
        }
      >()

      for (const row of data as EvidenceRow[]) {
        const std = Array.isArray(row.ccss_standards) ? row.ccss_standards[0] : row.ccss_standards
        if (!std) continue

        if (!standardMap.has(row.ccss_standard_code)) {
          standardMap.set(row.ccss_standard_code, {
            meta: std,
            students: new Map(),
          })
        }
        const entry = standardMap.get(row.ccss_standard_code)!
        // Keep highest mastery level per student per standard
        const prev = entry.students.get(row.user_id)
        const levels = ['emerging', 'developing', 'proficient', 'advanced']
        if (!prev || levels.indexOf(row.mastery_level) > levels.indexOf(prev)) {
          entry.students.set(row.user_id, row.mastery_level)
        }
      }

      const result: StandardSummary[] = []
      for (const [code, entry] of standardMap) {
        let emerging = 0,
          developing = 0,
          proficient = 0,
          advanced = 0
        for (const level of entry.students.values()) {
          if (level === 'emerging') emerging++
          else if (level === 'developing') developing++
          else if (level === 'proficient') proficient++
          else if (level === 'advanced') advanced++
        }
        result.push({
          standardCode: code,
          strand: entry.meta.strand as 'ELA' | 'Math',
          grade: entry.meta.grade,
          domain: entry.meta.domain,
          description: entry.meta.description,
          studentCount: entry.students.size,
          emerging,
          developing,
          proficient,
          advanced,
        })
      }

      // Sort: strand → grade → code
      result.sort((a, b) => {
        if (a.strand !== b.strand) return a.strand.localeCompare(b.strand)
        if (a.grade !== b.grade) return a.grade.localeCompare(b.grade, undefined, { numeric: true })
        return a.standardCode.localeCompare(b.standardCode)
      })

      setSummaries(result)
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [studentIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = summaries.filter((s) => {
    if (strandFilter !== 'All' && s.strand !== strandFilter) return false
    if (gradeFilter !== 'All' && s.grade !== gradeFilter) return false
    return true
  })

  const availableGrades = [...new Set(summaries.map((s) => s.grade))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  if (studentIds.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-500">No students linked yet.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Class Standards Progress</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Aggregated CCSS evidence across {totalStudents} student
          {totalStudents !== 1 ? 's' : ''} · {summaries.length} standard
          {summaries.length !== 1 ? 's' : ''} with evidence
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'ELA', 'Math'] as StrandFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStrandFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              strandFilter === s
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="mx-1 border-l border-slate-200" />
        <button
          type="button"
          onClick={() => setGradeFilter('All')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            gradeFilter === 'All'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All grades
        </button>
        {availableGrades.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGradeFilter(g)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              gradeFilter === g
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Gr {g}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'emerging', label: 'Emerging', color: MASTERY_COLORS.emerging },
          { key: 'developing', label: 'Developing', color: MASTERY_COLORS.developing },
          { key: 'proficient', label: 'Proficient', color: MASTERY_COLORS.proficient },
          { key: 'advanced', label: 'Advanced', color: MASTERY_COLORS.advanced },
        ].map((item) => (
          <span key={item.key} className="flex items-center gap-1 text-xs text-slate-500">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No standards evidence yet for the selected filter.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm" aria-label="Class CCSS standards progress">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th scope="col" className="px-4 py-3">
                  Standard
                </th>
                <th scope="col" className="px-4 py-3">
                  Domain
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Students
                </th>
                <th scope="col" className="px-4 py-3 min-w-[140px]">
                  Mastery distribution
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.standardCode}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-mono text-xs font-semibold text-brand-700">
                        {s.standardCode}
                      </span>
                      <span
                        className={`ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          s.strand === 'ELA'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {s.strand} · Gr {s.grade}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{s.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.domain}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-800">{s.studentCount}</span>
                    <span className="text-xs text-slate-400">/{totalStudents}</span>
                  </td>
                  <td className="px-4 py-3">
                    <MasteryBar
                      total={s.studentCount}
                      emerging={s.emerging}
                      developing={s.developing}
                      proficient={s.proficient}
                      advanced={s.advanced}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      {s.proficient + s.advanced} at/above proficiency
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
