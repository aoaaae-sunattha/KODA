import { useStore } from '../store/useStore'
import { formatCurrency, formatDate } from '../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Clock, Banknote, LogOut } from 'lucide-react'
import { useState } from 'react'
import Counter from '../components/ui/Counter'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  settled: { bg: 'bg-emerald-100', color: 'text-emerald-700', label: 'Settled', icon: <CheckCircle2 size={12} /> },
  pending: { bg: 'bg-amber-100', color: 'text-amber-700', label: 'Pending', icon: <Clock size={12} /> },
  held:    { bg: 'bg-red-100', color: 'text-red-700', label: 'Held', icon: <AlertCircle size={12} /> },
}

export default function Merchant() {
  const { merchantOrders, currentUser, logout, settleOrder } = useStore()
  const [showSettleToast, setShowSettleToast] = useState(false)

  const totalSettled = merchantOrders
    .filter(o => o.status === 'settled')
    .reduce((s, o) => s + o.payout, 0)

  const handleSettle = (id: string) => {
    settleOrder(id)
    setShowSettleToast(true)
    setTimeout(() => setShowSettleToast(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">
            K
          </div>
          <span className="text-xl font-black text-text-primary tracking-tight">KODA<span className="text-primary">.merchant</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-text-primary">{currentUser?.businessName ?? 'Merchant Portal'}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Verified Partner</p>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </nav>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-6 py-10"
      >
        {/* Summary Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Total Settled Payouts</p>
            <div className="text-5xl font-black text-emerald-500 tracking-tight">
              <Counter value={totalSettled} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1 md:flex-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-xl font-bold text-slate-900">{merchantOrders.length}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1 md:flex-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-xl font-bold text-amber-500">
                {merchantOrders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settlement Table */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-20"
        >
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-text-primary">Recent Settlements</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Banknote size={14} className="text-primary" />
              <span>Real-time tracking</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Order ID', 'Date', 'Gross Amount', 'KODA Fee (2.5%)', 'Net Payout', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {merchantOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                          <Banknote size={32} />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">No settlements yet</h3>
                        <p className="text-slate-400 text-sm font-medium">
                          New payouts will appear here as customers complete their purchases.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {merchantOrders.map((order) => {
                      const style = STATUS_STYLES[order.status]
                      return (
                        <motion.tr
                          layout
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-8 py-5 font-bold text-slate-900">{order.orderId}</td>
                          <td className="px-8 py-5 text-sm text-slate-500 font-medium">{formatDate(order.date)}</td>
                          <td className="px-8 py-5 text-sm text-slate-900 font-bold">{formatCurrency(order.amount)}</td>
                          <td className="px-8 py-5 text-sm text-slate-400 font-medium">-{formatCurrency(order.commission)}</td>
                          <td className="px-8 py-5 text-sm text-emerald-600 font-black">{formatCurrency(order.payout)}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.color}`}>
                              {style.icon}
                              {style.label}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {order.status === 'pending' ? (
                              <button
                                onClick={() => handleSettle(order.id)}
                                className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-95"
                              >
                                Settle
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Completed</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSettleToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Payout Settled Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
