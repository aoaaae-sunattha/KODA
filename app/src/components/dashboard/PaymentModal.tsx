import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import type { Order } from '../../data/types'

type PaymentType = 'next' | 'specific' | 'full'

interface PaymentModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (type: PaymentType, amount: number) => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('next')
  const [specificAmount, setSpecificAmount] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentType('next')
      setSpecificAmount('')
    }
  }, [isOpen])

  if (!order) return null

  const nextUnpaid = order.installments.find(i => i.status !== 'paid')
  const remainingBalance = order.installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0)
  const nextAmount = nextUnpaid?.amount ?? 0
  const parsedSpecific = parseFloat(specificAmount) || 0
  const isSpecificValid = parsedSpecific >= 1 && parsedSpecific <= remainingBalance

  const isConfirmDisabled = paymentType === 'specific' && !isSpecificValid

  const getConfirmAmount = (): number => {
    switch (paymentType) {
      case 'next': return nextAmount
      case 'specific': return parsedSpecific
      case 'full': return remainingBalance
    }
  }

  const handleConfirm = () => {
    if (isConfirmDisabled) return
    onConfirm(paymentType, getConfirmAmount())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            data-testid="payment-modal"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{order.merchant}</h2>
                <p className="text-sm text-gray-400 font-medium">
                  Remaining: {formatCurrency(remainingBalance)}
                </p>
              </div>
              <button
                data-testid="cancel-payment-btn"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Payment type options */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Type of payment</p>

              {/* Option: Next installment */}
              <label
                data-testid="payment-option-next"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'next' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="next"
                  checked={paymentType === 'next'}
                  onChange={() => setPaymentType('next')}
                  className="accent-primary w-4 h-4"
                />
                <span className="flex-1 font-medium text-gray-900">Pay my next installment</span>
                <span className="font-bold text-gray-900">{formatCurrency(nextAmount)}</span>
              </label>

              {/* Option: Specific amount */}
              <label
                data-testid="payment-option-specific"
                className={`flex flex-col px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'specific' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentType"
                    value="specific"
                    checked={paymentType === 'specific'}
                    onChange={() => setPaymentType('specific')}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="flex-1 font-medium text-gray-900">Pay specific amount</span>
                </div>
                {paymentType === 'specific' && (
                  <div className="mt-3 ml-7">
                    <input
                      data-testid="specific-amount-input"
                      type="number"
                      min={1}
                      max={remainingBalance}
                      step="0.01"
                      value={specificAmount}
                      onChange={e => setSpecificAmount(e.target.value)}
                      placeholder={`$1 – ${formatCurrency(remainingBalance)}`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    {specificAmount && !isSpecificValid && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Enter an amount between $1 and {formatCurrency(remainingBalance)}
                      </p>
                    )}
                  </div>
                )}
              </label>

              {/* Option: Full balance */}
              <label
                data-testid="payment-option-full"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'full' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === 'full'}
                  onChange={() => setPaymentType('full')}
                  className="accent-primary w-4 h-4"
                />
                <span className="flex-1 font-medium text-gray-900">Pay off my balance in full</span>
                <span className="font-bold text-gray-900">{formatCurrency(remainingBalance)}</span>
              </label>
            </div>

            {/* Confirm button */}
            <button
              data-testid="confirm-payment-btn"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Payment
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
