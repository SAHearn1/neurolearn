// EDU-14: Alert Badge component
// Small red badge showing unread alert count for educator nav

interface Props {
  count: number
}

export function AlertBadge({ count }: Props) {
  if (count === 0) return null

  return (
    <span
      className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white"
      aria-label={`${count} unread alert${count === 1 ? '' : 's'}`}
      role="status"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
