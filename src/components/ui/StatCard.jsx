import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  primary: { wrap: 'bg-primary-50 border-primary-100', icon: 'text-primary-500' },
  success: { wrap: 'bg-success-50 border-success-100', icon: 'text-success-500' },
  warning: { wrap: 'bg-warning-50 border-warning-100', icon: 'text-warning-500' },
  danger:  { wrap: 'bg-danger-50  border-danger-100',  icon: 'text-danger-500'  },
}

const trendStyle = {
  up:      { color: 'text-success-600', Icon: TrendingUp },
  down:    { color: 'text-danger-600',  Icon: TrendingDown },
  neutral: { color: 'text-gray-400',    Icon: Minus },
}

export default function StatCard({ icon: Icon, label, value, trend = 'neutral', trendValue = '', color = 'primary' }) {
  const c = colorMap[color] ?? colorMap.primary
  const t = trendStyle[trend] ?? trendStyle.neutral

  return (
    <div className="card transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {trendValue && (
            <div className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${t.color}`}>
              <t.Icon size={11} strokeWidth={2.5} />
              <span>{trendValue} dari kemarin</span>
            </div>
          )}
        </div>
        <div className={`shrink-0 rounded-2xl border p-3 ${c.wrap}`}>
          <Icon size={20} className={c.icon} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}
