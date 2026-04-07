import React from 'react'
import { addMonths } from 'date-fns'
import { calculatePlan } from '../../data/feeRates'
import type { Term, Installment } from '../../data/types'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface PaymentTimelineProps {
  price?: number
  term?: Term
  installments?: Installment[]
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ price, term, installments }) => {
  // Compute plan once and reuse
  const plan = React.useMemo(() => (price && term ? calculatePlan(price, term) : null), [price, term])
  
  // Use provided installments or calculate a new plan
  const items = React.useMemo<Installment[]>(() => {
    const today = new Date()
    if (installments) return installments
    if (plan) {
      return plan.installments.map((amount, i) => ({
        index: i,
        amount,
        originalAmount: amount,
        dueDate: addMonths(today, i).toISOString(),
        status: i === 0 ? 'paid' : 'upcoming'
      }))
    }
    return []
  }, [installments, plan])

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        No payment schedule available.
      </div>
    )
  }

  const hasFee = plan ? plan.fee > 0 : installments ? installments.some((_, i) => i === 0) : false // Simplified check for fee in first installment context

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {items.map((inst, i) => {
        const isFirst = i === 0
        const isPaid = inst.status === 'paid'
        const isOverdue = inst.status === 'overdue'
        
        // Progress ring calculation: 2 * PI * r (r=18) = 113.097
        const circumference = 113.1
        const strokeDasharray = circumference
        const strokeDashoffset = isPaid ? 0 : circumference

        return (
          <div 
            key={i} 
            data-testid={`timeline-card-${i}`}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              isPaid 
                ? 'bg-emerald-50/30 border-emerald-100' 
                : isOverdue
                  ? 'bg-red-50/50 border-red-100'
                  : isFirst 
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
                  className={`${
                    isPaid ? 'stroke-emerald-500' : 
                    isOverdue ? 'stroke-red-500' :
                    isFirst ? 'stroke-primary' : 'stroke-slate-200'
                  }`}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
                isPaid ? 'text-emerald-600' :
                isOverdue ? 'text-red-600' :
                isFirst ? 'text-primary' : 'text-slate-400'
              }`}>
                {i + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-bold truncate ${
                    isPaid ? 'text-emerald-900' :
                    isOverdue ? 'text-red-900' :
                    isFirst ? 'text-primary' : 'text-slate-900'
                  }`}>
                    {isFirst && !installments ? 'Upon checkout' : inst.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : `Payment ${i + 1}`}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {formatShortDate(inst.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p 
                    data-testid={`timeline-amount-${i}`}
                    className={`text-sm font-black ${isPaid ? 'text-emerald-700' : isOverdue ? 'text-red-700' : isFirst ? 'text-slate-900' : 'text-slate-600'}`}
                  >
                    {formatCurrency(inst.amount)}
                  </p>
                  {isFirst && hasFee && (
                    <p data-testid="timeline-fee-label" className="text-[9px] font-bold text-primary/60 uppercase">
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
