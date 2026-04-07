import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { AlertCircle, AlertTriangle, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react'
import CreditGauge from '../components/dashboard/CreditGauge'
import OrderCard from '../components/dashboard/OrderCard'
import { IDVerifyModal } from '../components/checkout/IDVerifyModal'
import { RefundModal } from '../components/dashboard/RefundModal'
import { PaymentModal } from '../components/dashboard/PaymentModal'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Order } from '../data/types'

export default function Dashboard() {
  const { currentUser, orders, payOverdue, payInstallment, paySpecificAmount, payFullBalance } = useStore()
  const used = useStore(s => s.getUsedCredit())
  const available = useStore(s => s.getAvailableCredit())
  const [isKYCOpen, setIsKYCOpen] = useState(false)
  const [showPaySuccess, setShowPaySuccess] = useState(false)
  
  // Shared Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalType, setModalType] = useState<'payment' | 'refund' | null>(null)

  const navigate = useNavigate()

  if (!currentUser) return null

  const handlePayOverdue = () => {
    payOverdue()
    setShowPaySuccess(true)
    setTimeout(() => setShowPaySuccess(false), 3000)
  }

  const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'overdue' || o.status === 'pending')
  const completedOrders = orders.filter(o => o.status === 'completed')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Account Alerts */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {currentUser.accountStatus === 'locked' && (
              <motion.div 
                key="locked-alert"
                data-testid="locked-banner"
                variants={itemVariants}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900">Account Locked</h4>
                  <p className="text-xs text-red-700 font-medium">Overdue payments detected. Settle them to resume shopping.</p>
                </div>
                <button 
                  onClick={handlePayOverdue}
                  data-testid="pay-overdue-btn"
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
                >
                  Pay Now
                </button>
              </motion.div>
            )}

            {currentUser.accountStatus === 'action_required' && (
              <motion.div 
                key="action-alert"
                data-testid="action-banner"
                variants={itemVariants}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Action Required</h4>
                  <p className="text-xs text-amber-700 font-medium">Payment failed on {new Date().toLocaleDateString()} - Update Card</p>
                </div>
                <button 
                  onClick={() => navigate('/settings/cards')}
                  data-testid="update-card-btn"
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-200 hover:bg-amber-700 transition-colors"
                >
                  Update Card
                </button>
              </motion.div>
            )}

            {showPaySuccess && (
              <motion.div 
                key="pay-success"
                data-testid="pay-success-banner"
                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900">Payments Settled</h4>
                  <p className="text-xs text-emerald-700 font-medium">Your account is now active again. Happy shopping!</p>
                </div>
              </motion.div>
            )}

            {!currentUser.verified && (
              <motion.div 
                key="verify-alert"
                data-testid="verify-banner"
                variants={itemVariants}
                className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-indigo-900">Identity Verification</h4>
                  <p className="text-xs text-indigo-700 font-medium">Complete KYC to unlock your full shopping power.</p>
                </div>
                <button 
                  onClick={() => setIsKYCOpen(true)}
                  data-testid="verify-now-btn"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200"
                >
                  Verify
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <IDVerifyModal isOpen={isKYCOpen} onClose={() => setIsKYCOpen(false)} />

        {/* Global Modals for Orders */}
        <RefundModal 
          order={selectedOrder}
          isOpen={modalType === 'refund'}
          onClose={() => {
            setModalType(null)
            setSelectedOrder(null)
          }}
        />

        <PaymentModal
          order={selectedOrder}
          isOpen={modalType === 'payment'}
          onClose={() => {
            setModalType(null)
            setSelectedOrder(null)
          }}
          onConfirm={(type, amount) => {
            if (!selectedOrder) return
            switch (type) {
              case 'next':
                payInstallment(selectedOrder.id)
                break
              case 'specific':
                paySpecificAmount(selectedOrder.id, amount)
                break
              case 'full':
                payFullBalance(selectedOrder.id)
                break
            }
            setModalType(null)
            setSelectedOrder(null)
          }}
        />

        {/* Credit Utilization Gauge */}
        <motion.div variants={itemVariants}>
          <CreditGauge 
            used={used} 
            available={available} 
            limit={currentUser.creditLimit} 
          />
        </motion.div>

        {/* Orders Section */}
        <div className="space-y-8">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
                Active Purchases ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {activeOrders.map(order => (
                    <motion.div 
                      layout
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OrderCard 
                        order={order} 
                        onOpenPayment={() => {
                          setSelectedOrder(order)
                          setModalType('payment')
                        }}
                        onOpenRefund={() => {
                          setSelectedOrder(order)
                          setModalType('refund')
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* Empty state */}
          {orders.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-dashed border-gray-200"
            >
              <div className="w-20 h-20 bg-[#F5F0EC] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-[#5D5FEF]" />
              </div>
              <h3 className="font-black text-2xl text-gray-900 mb-2">No orders yet</h3>
              <p className="text-sm text-gray-500 font-medium max-w-[240px] mx-auto mb-8">
                Ready to split your first purchase? Explore our curated shop.
              </p>
              <Link 
                to="/store"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors"
              >
                Start Shopping
              </Link>
            </motion.div>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <motion.section 
              variants={itemVariants}
              className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
                Completed ({completedOrders.length})
              </h2>
              <div className="space-y-3">
                {completedOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onOpenPayment={() => {
                      setSelectedOrder(order)
                      setModalType('payment')
                    }}
                    onOpenRefund={() => {
                      setSelectedOrder(order)
                      setModalType('refund')
                    }}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </motion.div>
    </div>
  )
}
