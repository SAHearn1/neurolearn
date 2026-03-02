import { Card } from '../ui/Card'

interface RecentActivityProps {
  items: string[]
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
