import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { formatCurrency, formatShortDate } from '../../utils/format'
import type { Order } from '../../data/types'
import { ChevronRight, Undo2 } from 'lucide-react'
import { RefundModal } from './RefundModal'

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  const { payInstallment, simulateFailure } = useStore()
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const paidAmount = order.installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)
  const originalTotal = order.principal + order.fee
  const paidPct = (paidAmount / originalTotal) * 100
  const refundedPct = (order.refundedAmount / originalTotal) * 100
  const remainingPct = 100 - paidPct - refundedPct

  const nextUnpaid = order.installments.find(i => i.status !== 'paid')
  const maxRefundable = order.installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-transparent hover:border-gray-200 transition-colors"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-[#5D5FEF] border border-gray-100">
            {order.merchant[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{order.merchant}</h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
              {order.merchantCategory} · {order.term} payments
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <div className="text-xl font-black text-gray-900">
              {formatCurrency(order.total)}
            </div>
            {order.refundedAmount > 0 && (
              <div className="flex flex-col items-end gap-0">
                <span className="text-[10px] font-bold text-gray-300 line-through leading-none">
                  {formatCurrency(originalTotal)}
                </span>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  {formatCurrency(order.refundedAmount)} Refunded
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mb-6 relative h-5 flex items-center">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5 relative">
          {/* Paid */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            onMouseEnter={() => setHoveredSegment('Paid')}
            onMouseLeave={() => setHoveredSegment(null)}
            className="h-full bg-[#3EB489] cursor-pointer"
          />
          {/* Refunded */}
          {refundedPct > 0 && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${refundedPct}%` }}
              onMouseEnter={() => setHoveredSegment('Refunded')}
              onMouseLeave={() => setHoveredSegment(null)}
              className="h-full bg-orange-500 cursor-pointer"
            />
          )}
          {/* Remaining */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${remainingPct}%` }}
            onMouseEnter={() => setHoveredSegment('Remaining')}
            onMouseLeave={() => setHoveredSegment(null)}
            className="h-full bg-[#C7D2FE] cursor-pointer"
          />
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredSegment && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -25, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap z-10"
            >
              {hoveredSegment}: {
                hoveredSegment === 'Paid' ? formatCurrency(paidAmount) :
                hoveredSegment === 'Refunded' ? formatCurrency(order.refundedAmount) :
                formatCurrency(order.total - paidAmount)
              }
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
        <span>{order.paidCount} / {order.term} Payments</span>
        {nextUnpaid && order.status !== 'completed' && (
          <span className="text-gray-900">Next: {formatShortDate(nextUnpaid.dueDate)}</span>
        )}
      </div>

      {/* Actions */}
      {order.status !== 'completed' && (
        <div className="flex gap-3">
          {nextUnpaid && (
            <button
              onClick={() => payInstallment(order.id)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#5D5FEF] text-white text-sm font-bold shadow-lg shadow-[#5D5FEF]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Pay {formatCurrency(nextUnpaid.amount)}
              <ChevronRight size={16} />
            </button>
          )}
          {order.paidCount > 0 && maxRefundable > 0 && (
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="py-3 px-6 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Undo2 size={16} />
              Refund
            </button>
          )}
          {order.status === 'active' && (
            <button
              onClick={() => simulateFailure(order.id)}
              disabled={order.status !== 'active'}
              className="text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors px-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Simulate Failure
            </button>
          )}
        </div>
      )}

      <RefundModal 
        order={order}
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
      />
    </motion.div>
  )
}
