import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TERMS, calculatePlan, TERM_THRESHOLDS } from '../../data/feeRates'
import type { Term } from '../../data/types'
import { formatCurrency } from '../../utils/format'

interface PlanSelectorProps {
  price: number
  selectedTerm: Term
  onTermSelect: (term: Term) => void
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  price,
  selectedTerm,
  onTermSelect,
}) => {
  const plans = useMemo(
    () => Object.fromEntries(TERMS.map(t => [t, calculatePlan(price, t)])) as Record<Term, ReturnType<typeof calculatePlan>>,
    [price]
  )
  const selectedPlan = plans[selectedTerm]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {TERMS.map((term) => {
          const plan = plans[term]
          const isSelected = selectedTerm === term
          const isAvailable = price >= TERM_THRESHOLDS[term]

          return (
            <button
              key={term}
              disabled={!isAvailable}
              onClick={() => onTermSelect(term)}
              className={`relative flex flex-col items-center justify-center p-3 py-4 rounded-xl border-2 transition-all duration-200 text-center group ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : isAvailable
                    ? 'border-slate-100 bg-white hover:border-slate-200 cursor-pointer'
                    : 'border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
              }`}>
                {term} Months
              </span>
              <span className="text-sm font-black text-slate-900 leading-none">
                {formatCurrency(plan.monthly)}
              </span>

              {isAvailable && (
                <div className="mt-1.5 h-4 flex items-center justify-center">
                  {term === 4 ? (
                    <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold bg-success/10 text-success uppercase">
                      Free
                    </span>
                  ) : plan.fee > 0 ? (
                    <span className="text-[8px] font-bold text-slate-400">
                      +{formatCurrency(plan.fee)} fee
                    </span>
                  ) : null}
                </div>
              )}
              
              {!isAvailable && (
                <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                  <span className="bg-slate-200 text-slate-500 text-[8px] font-bold px-1 rounded uppercase">
                    ${TERM_THRESHOLDS[term]}+
                  </span>
                </div>
              )}
              
              {isSelected && (
                <motion.div
                  layoutId="plan-active"
                  className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Summary Card */}
      <motion.div 
        key={selectedTerm}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-500 font-medium">Total to pay</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(selectedPlan.total)}
          </span>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">First payment (Today)</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(selectedPlan.firstPayment)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Includes first installment + {selectedTerm > 4 ? formatCurrency(selectedPlan.fee) + ' one-time setup fee' : '0% interest'}.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
