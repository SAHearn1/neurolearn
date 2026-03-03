interface AvatarProps {
  name: string
  src?: string
}

export function Avatar({ name, src }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  if (src) {
    return <img alt={name} className="h-10 w-10 rounded-full object-cover" src={src} />
  }

  return (
    <span
      aria-label={name}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700"
      role="img"
    >
      {initials || 'U'}
    </span>
  )
}
