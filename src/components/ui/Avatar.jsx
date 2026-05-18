const palette = [
  'bg-primary-100 text-primary-700',
  'bg-success-100 text-success-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
]

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export default function Avatar({ name = '?', src = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()

  const color = palette[(name.charCodeAt(0) ?? 0) % palette.length]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${sizes[size]} ${className}`}
      />
    )
  }

  return (
    <div className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${sizes[size]} ${color} ${className}`}>
      {initials}
    </div>
  )
}
