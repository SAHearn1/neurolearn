interface StatPillProps {
  icon: string
  value: string | number
  label: string
  pulse?: boolean
}

export function StatPill({ icon, value, label, pulse = false }: StatPillProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-white backdrop-blur-sm">
      <span className={pulse ? 'animate-streak' : undefined}>{icon}</span>
      <span className="font-bold">{value}</span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  )
}
