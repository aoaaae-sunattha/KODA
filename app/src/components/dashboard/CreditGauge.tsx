import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/format'
import Counter from '../ui/Counter'

interface CreditGaugeProps {
  used: number
  available: number
  limit: number
}

export default function CreditGauge({ used, available, limit }: CreditGaugeProps) {
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  
  const color = usedPct >= 90 ? '#EF4444' : usedPct >= 60 ? '#F59E0B' : '#5D5FEF'
  const statusLabel = usedPct >= 100 ? 'Limit reached' : usedPct >= 90 ? 'Near limit' : null

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-white/50">
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">
            Available Credit
          </span>
          <div className="text-4xl font-black text-gray-900 tracking-tight">
            <Counter value={available} />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 block mb-1">Total Limit</span>
          <span className="text-sm font-bold text-gray-600">{formatCurrency(limit)}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(usedPct, 100)}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-xs font-bold text-gray-400">
          <Counter value={used} className="text-gray-900" /> used
        </span>
        <div className="flex items-center gap-2">
          {statusLabel && (
            <span className="text-xs font-bold" style={{ color }}>
              {statusLabel}
            </span>
          )}
          <span className="text-xs font-bold text-gray-400">
            {Math.round(usedPct)}%
          </span>
        </div>
      </div>
    </div>
  )
}
