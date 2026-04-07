import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Undo2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { formatCurrency } from '../../utils/format'
import type { Order } from '../../data/types'

interface RefundModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export const RefundModal: React.FC<RefundModalProps> = ({ order, isOpen, onClose }) => {
  const [amount, setAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const simulateRefund = useStore(s => s.simulateRefund)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmount('')
      setIsProcessing(false)
      setIsSuccess(false)
    }
  }, [isOpen])

  if (!order) return null

  // Max refundable is the sum of unpaid installments
  const maxRefundable = order.installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const handleQuickSelect = (percent: number) => {
    const val = Math.round(maxRefundable * percent)
    setAmount(val.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const refundVal = Math.round(parseFloat(amount) * 100) / 100
    if (isNaN(refundVal) || refundVal <= 0 || refundVal > (maxRefundable + 0.01)) return

    setIsProcessing(true)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200))
    
    simulateRefund(order.id, refundVal)
    setIsProcessing(false)
    setIsSuccess(true)
    
    setTimeout(() => {
      setIsSuccess(false)
      setAmount('')
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            data-testid="refund-modal"
            className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
          >
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                data-testid="refund-success"
                className="p-12 text-center"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Refund Processed</h2>
                <p className="text-sm text-slate-500">
                  {formatCurrency(Math.round(parseFloat(amount)))} has been deducted from the final installments of your {order.merchant} order.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={14} />
                  <span data-testid="refund-simulation-label-success" className="text-[10px] font-bold uppercase tracking-widest leading-none">Simulation only · No real funds moved</span>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <Undo2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 leading-tight">Simulate Refund</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.merchant}</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose} 
                    data-testid="refund-close-btn"
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Refund Amount
                      </label>
                      <span data-testid="refund-max-amount" className="text-[10px] font-bold text-slate-400">
                        Max: {formatCurrency(maxRefundable)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        min="1"
                        max={maxRefundable}
                        required
                        data-testid="refund-amount-input"
                        className="w-full pl-10 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-black text-3xl text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Select */}
                  <div className="flex gap-2">
                    {[0.25, 0.5, 1].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickSelect(pct)}
                        data-testid={`refund-percent-${pct * 100}`}
                        className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
                      >
                        {pct * 100}%
                      </button>
                    ))}
                  </div>

                  <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 space-y-3">
                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Reconciliation Logic</h4>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 text-[10px] font-bold">1</div>
                      <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                        Subtracts from the <strong>last unpaid installment</strong> first.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 text-[10px] font-bold">2</div>
                      <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                        Reduces your current balance and total purchase price.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || !amount || Math.round(parseFloat(amount)) > maxRefundable}
                      data-testid="refund-submit-btn"
                      className="w-full py-5 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            data-testid="refund-spinner"
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Refund</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                      <ShieldCheck size={14} />
                      <span data-testid="refund-simulation-label" className="text-[10px] font-bold uppercase tracking-widest leading-none">Simulation only · No real funds moved</span>
                    </div>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
