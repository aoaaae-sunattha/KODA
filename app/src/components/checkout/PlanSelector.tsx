import React from 'react'
import { motion } from 'framer-motion'
import { calculatePlan, getAvailableTerms } from '../../data/feeRates'
import { formatCurrency } from '../../utils/format'

interface PlanSelectorProps {
  price: number
  selectedTerm: number
  onTermSelect: (term: number) => void
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  price,
  selectedTerm,
  onTermSelect,
}) => {
  const availableTerms = getAvailableTerms(price)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableTerms.map((term) => {
          const plan = calculatePlan(price, term)
          const isSelected = selectedTerm === term

          return (
            <button
              key={term}
              onClick={() => onTermSelect(term)}
              className={`relative flex-1 min-w-[80px] px-3 py-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isSelected ? 'text-primary' : 'text-slate-500'
                }`}>
                  {term} Months
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(plan.monthly)}
                </span>
                {term === 4 && (
                  <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success uppercase">
                    Free
                  </span>
                )}
                {plan.fee > 0 && (
                  <span className="mt-1 text-[10px] font-medium text-slate-400">
                    +{formatCurrency(plan.fee)} fee
                  </span>
                )}
              </div>
              
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
            {formatCurrency(calculatePlan(price, selectedTerm).total)}
          </span>
        </div>
        
        <div className="space-y-2 pt-3 border-t border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">First payment (Today)</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(calculatePlan(price, selectedTerm).firstPayment)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Includes first installment + {selectedTerm > 4 ? formatCurrency(calculatePlan(price, selectedTerm).fee) + ' one-time setup fee' : '0% interest'}.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
