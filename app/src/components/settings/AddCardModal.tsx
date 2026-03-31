import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, X, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose }) => {
  const [brand, setBrand] = useState<'visa' | 'mastercard'>('visa')
  const [last4, setLast4] = useState('')
  const [expiry, setExpiry] = useState('')
  const addCard = useStore(s => s.addCard)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (last4.length !== 4) return

    const [month, year] = expiry.split('/')
    addCard({
      last4,
      brand,
      expiryMonth: parseInt(month) || 12,
      expiryYear: 2000 + (parseInt(year) || 29),
      isPrimary: false,
    })
    onClose()
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
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add New Card</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Brand Selection */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {['visa', 'mastercard'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b as any)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                      brand === b 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Card Number (Last 4 Only) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Last 4 Digits
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-mono tracking-widest text-lg">
                    •••• •••• ••••
                  </span>
                  <input
                    type="text"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="4242"
                    required
                    className="w-full pl-36 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-mono text-lg text-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  placeholder="12/29"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-mono text-lg text-slate-900 transition-all outline-none"
                />
              </div>

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <CreditCard size={18} />
                  Save Payment Method
                </button>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Tokenized Storage</span>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
