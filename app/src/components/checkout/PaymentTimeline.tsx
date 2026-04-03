import React from 'react'
import { addMonths } from 'date-fns'
import { calculatePlan } from '../../data/feeRates'
import type { Term } from '../../data/types'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface PaymentTimelineProps {
  price: number
  term: Term
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ price, term }) => {
  const plan = calculatePlan(price, term)
  const today = new Date()

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {Array.from({ length: term }).map((_, i) => {
        const isFirst = i === 0
        const date = addMonths(today, i)
        const amount = plan.installments[i]
        
        // Simple progress ring calculation
        const strokeDasharray = 100
        const strokeDashoffset = isFirst ? 0 : 100 // Filled for the first one (due now)

        return (
          <div 
            key={i} 
            data-testid={`timeline-card-${i}`}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              isFirst 
                ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/5' 
                : 'bg-white border-slate-100'
            }`}
          >
            {/* Progress Ring SVG */}
            <div className="relative w-10 h-10 flex-shrink-0" data-testid={`timeline-ring-${i}`}>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  className="stroke-slate-100"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  className={`${isFirst ? 'stroke-primary' : 'stroke-slate-200'}`}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isFirst ? 'text-primary' : 'text-slate-400'}`}>
                {i + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-bold truncate ${isFirst ? 'text-primary' : 'text-slate-900'}`}>
                    {isFirst ? 'Upon checkout' : `Payment ${i + 1}`}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {formatShortDate(date.toISOString())}
                  </p>
                </div>
                <div className="text-right">
                  <p 
                    data-testid={`timeline-amount-${i}`}
                    className={`text-sm font-black ${isFirst ? 'text-slate-900' : 'text-slate-600'}`}
                  >
                    {formatCurrency(amount)}
                  </p>
                  {isFirst && plan.fee > 0 && (
                    <p className="text-[9px] font-bold text-primary/60 uppercase">
                      Incl. Fee
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
