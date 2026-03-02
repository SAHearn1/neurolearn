import { ProgressBar } from '../ui/ProgressBar'

interface ProgressWidgetProps {
  complete: number
  total: number
}

export function ProgressWidget({ complete, total }: ProgressWidgetProps) {
  const value = total > 0 ? Math.round((complete / total) * 100) : 0
  return <ProgressBar label={`${complete}/${total} lessons complete`} value={value} />
}
