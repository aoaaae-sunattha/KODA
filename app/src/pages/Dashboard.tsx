import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { AlertCircle, AlertTriangle, ShieldCheck, ShoppingBag } from 'lucide-react'
import CreditGauge from '../components/dashboard/CreditGauge'
import OrderCard from '../components/dashboard/OrderCard'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { currentUser, orders } = useStore()
  const used = useStore(s => s.getUsedCredit())
  const available = useStore(s => s.getAvailableCredit())

  if (!currentUser) return null

  const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'overdue' || o.status === 'pending')
  const completedOrders = orders.filter(o => o.status === 'completed')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EC' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Account Alerts */}
        <div className="space-y-3">
          {currentUser.accountStatus === 'locked' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900">Account Locked</h4>
                <p className="text-xs text-red-700 font-medium">Overdue payments detected. Settle them to resume shopping.</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-200">Pay Now</button>
            </motion.div>
          )}

          {currentUser.accountStatus === 'action_required' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900">Action Required</h4>
                <p className="text-xs text-amber-700 font-medium">Update your payment method to avoid service interruption.</p>
              </div>
              <button className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-200">Update Card</button>
            </motion.div>
          )}

          {!currentUser.verified && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-indigo-900">Identity Verification</h4>
                <p className="text-xs text-indigo-700 font-medium">Complete KYC to unlock your full shopping power.</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200">Verify</button>
            </motion.div>
          )}
        </div>

        {/* Credit Utilization Gauge */}
        <CreditGauge 
          used={used} 
          available={available} 
          limit={currentUser.creditLimit} 
        />

        {/* Orders Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
                Active Purchases ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {orders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
            <section className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
                Completed ({completedOrders.length})
              </h2>
              <div className="space-y-3">
                {completedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  )
}
