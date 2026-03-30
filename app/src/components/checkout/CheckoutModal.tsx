import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react'
import { PlanSelector } from './PlanSelector'
import { PaymentTimeline } from './PaymentTimeline'
import { useStore } from '../../store/useStore'
import { formatCurrency } from '../../utils/format'
import type { Product } from '../../data/types'

interface CheckoutModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(4)
  const [isConfirming, setIsConfirming] = useState(false)
  const createOrder = useStore((state) => state.createOrder)
  const primaryCard = useStore((state) => state.cards.find(c => c.isPrimary))

  if (!product) return null

  const handleConfirm = async () => {
    setIsConfirming(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    createOrder(product, selectedTerm)
    setIsConfirming(false)
    onSuccess()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Review Purchase</h3>
                  <p className="text-xs text-slate-500">{product.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Product Info */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Purchase Amount</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Plan Selection */}
              <section>
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Select Payment Plan
                </h4>
                <PlanSelector
                  price={product.price}
                  selectedTerm={selectedTerm}
                  onTermSelect={setSelectedTerm}
                />
              </section>

              {/* Payment Timeline */}
              <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
                  Payment Schedule
                </h4>
                <PaymentTimeline price={product.price} term={selectedTerm} />
              </section>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 py-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-slate-400">
                  Secured by Anyway BNPL • Encrypted Payment
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-slate-100">
              {primaryCard ? (
                <div className="mb-4 flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white font-bold uppercase">
                      {primaryCard.brand}
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      •••• {primaryCard.last4}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase">Primary</span>
                </div>
              ) : (
                <div className="mb-4 text-center py-2 bg-amber-50 text-amber-600 text-xs rounded-lg border border-amber-100">
                  No payment method found. Please add one in settings.
                </div>
              )}

              <button
                disabled={isConfirming || !primaryCard}
                onClick={handleConfirm}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isConfirming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Purchase</span>
                )}
              </button>
              
              <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed">
                By confirming, you agree to Anyway's Terms of Service and Privacy Policy. 
                Your first payment will be charged immediately.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
