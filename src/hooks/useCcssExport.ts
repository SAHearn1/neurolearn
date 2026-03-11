// CCSS-02: IEP-compatible CSV export hook
// Issue #334: replaces window.print() placeholder with real CSV download

import { useState } from 'react'
import { supabase } from '../../utils/supabase/client'

interface CcssEvidenceRow {
  ccss_standard_code: string
  mastery_level: string
  evidence_count: number
  last_evidenced_at: string
  ccss_standards: {
    description: string
    grade: string
    domain: string
    strand: string
  } | null
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function useCcssExport(
  studentId: string,
  studentName: string,
): {
  exportPdf: () => Promise<void>
  exporting: boolean
} {
  const [exporting, setExporting] = useState(false)

  const exportPdf = async () => {
    setExporting(true)
    try {
      const { data } = await supabase
        .from('student_ccss_evidence')
        .select(
          'ccss_standard_code, mastery_level, evidence_count, last_evidenced_at, ccss_standards(description, grade, domain, strand)',
        )
        .eq('user_id', studentId)
        .order('ccss_standard_code')

      const rows = (data as CcssEvidenceRow[] | null) ?? []

      const headers = [
        'Student',
        'Standard Code',
        'Strand',
        'Grade',
        'Domain',
        'Standard Description',
        'Evidence Level',
        'Session Count',
        'Last Evidenced',
      ]

      const csvRows = rows.map((r) => {
        const std = r.ccss_standards
        return [
          escapeCsv(studentName),
          escapeCsv(r.ccss_standard_code),
          escapeCsv(std?.strand ?? ''),
          escapeCsv(std?.grade ?? ''),
          escapeCsv(std?.domain ?? ''),
          escapeCsv(std?.description ?? ''),
          escapeCsv(r.mastery_level),
          String(r.evidence_count),
          escapeCsv(new Date(r.last_evidenced_at).toLocaleDateString()),
        ].join(',')
      })

      const csvContent = [headers.join(','), ...csvRows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().slice(0, 10)
      const safeName = studentName.replace(/\s+/g, '')
      const a = document.createElement('a')
      a.href = url
      a.download = `ccss-evidence-${safeName}-${date}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return { exportPdf, exporting }
}
