import React from 'react'
import { addMonths } from 'date-fns'
import { calculatePlan } from '../../data/feeRates'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface PaymentTimelineProps {
  price: number
  term: number
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ price, term }) => {
  const plan = calculatePlan(price, term)
  const today = new Date()

  return (
    <div className="relative pl-8 space-y-4">
      {/* Timeline connector line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

      {Array.from({ length: term }).map((_, i) => {
        const isFirst = i === 0
        const isLast = i === term - 1
        const date = addMonths(today, i)
        
        let amount = plan.monthly
        if (isFirst) amount = plan.firstPayment
        if (isLast) amount = plan.lastMonthly

        return (
          <div key={i} className="relative flex items-center justify-between group">
            {/* Timeline Dot */}
            <div 
              className={`absolute -left-8 w-6 h-6 rounded-full border-4 transition-colors duration-200 z-10 ${
                isFirst 
                  ? 'bg-primary border-primary/20 ring-4 ring-primary/5' 
                  : 'bg-white border-slate-200'
              }`}
            />

            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${isFirst ? 'text-primary' : 'text-slate-500'}`}>
                {isFirst ? 'Today' : `Installment ${i + 1}`}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                {formatShortDate(date)}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className={`font-bold ${isFirst ? 'text-slate-900' : 'text-slate-600'}`}>
                {formatCurrency(amount)}
              </span>
              {isFirst && plan.fee > 0 && (
                <span className="text-[10px] text-slate-400">
                  (incl. {formatCurrency(plan.fee)} fee)
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
