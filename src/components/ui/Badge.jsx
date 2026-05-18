const variants = {
  default:          'bg-gray-100 text-gray-600',
  primary:          'bg-primary-50 text-primary-700',
  success:          'bg-success-50 text-success-700',
  warning:          'bg-warning-50 text-warning-700',
  danger:           'bg-danger-50 text-danger-700',
  aktif:            'bg-success-50 text-success-700',
  menunggu:         'bg-warning-50 text-warning-700',
  selesai:          'bg-gray-100 text-gray-500',
  kritis:           'bg-danger-50 text-danger-700',
  normal:           'bg-success-50 text-success-700',
  'perlu-perhatian':'bg-warning-50 text-warning-700',
}

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Badge({ variant = 'default', size = 'sm', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant] ?? variants.default} ${sizes[size]}`}>
      {children}
    </span>
  )
}
