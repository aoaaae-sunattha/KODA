import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TERMS, calculatePlan, TERM_THRESHOLDS } from '../../data/feeRates'
import type { Term } from '../../data/types'
import { formatCurrency } from '../../utils/format'

const PRIMARY_TERMS: Term[] = [4, 10, 18, 24]

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
  const [showOtherOptions, setShowOtherOptions] = useState(false)

  const plans = useMemo(
    () => Object.fromEntries(TERMS.map(t => [t, calculatePlan(price, t)])) as Record<Term, ReturnType<typeof calculatePlan>>,
    [price]
  )
  const selectedPlan = plans[selectedTerm]

  const visibleTerms: Term[] = useMemo(() => {
    if (!showOtherOptions) return PRIMARY_TERMS
    return [...TERMS].sort((a, b) => a - b)
  }, [showOtherOptions])

  const renderTermRow = (term: Term) => {
    const isSelected = selectedTerm === term
    const isAvailable = price >= TERM_THRESHOLDS[term]

    return (
      <button
        key={term}
        data-testid={`plan-option-${term}`}
        disabled={!isAvailable}
        onClick={() => isAvailable && onTermSelect(term)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left ${
          isSelected
            ? 'bg-primary/5 ring-1 ring-primary'
            : isAvailable
              ? 'bg-white hover:bg-gray-50 cursor-pointer'
              : 'bg-gray-50/50 opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Radio circle */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Term label */}
        <span className={`flex-1 font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
          {term} Payments
        </span>

        {/* Badges */}
        {term === 4 && isAvailable && (
          <span
            data-testid="plan-badge-free"
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white uppercase"
          >
            free
          </span>
        )}
        {term === 24 && isAvailable && (
          <span
            data-testid="plan-badge-flexible"
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white uppercase"
          >
            most flexible
          </span>
        )}

        {/* Threshold label for disabled terms */}
        {!isAvailable && (
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {formatCurrency(TERM_THRESHOLDS[term])}+
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Term list */}
      <div className="bg-gray-50 rounded-2xl p-2 space-y-1">
        {visibleTerms.map(renderTermRow)}
      </div>

      {/* Expand link */}
      {!showOtherOptions && (
        <button
          data-testid="expand-other-options"
          onClick={() => setShowOtherOptions(true)}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors pl-2"
        >
          + other options!
        </button>
      )}

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
