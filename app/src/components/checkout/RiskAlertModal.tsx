import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, CreditCard, X, ArrowRight, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { useStore } from '../../store/useStore'

export type RiskReason = 'locked' | 'insufficient' | 'action_required'

interface RiskAlertModalProps {
  isOpen: boolean
  onClose: () => void
  reason: RiskReason | null
  price?: number
}

export const RiskAlertModal: React.FC<RiskAlertModalProps> = ({
  isOpen,
  onClose,
  reason,
  price = 0,
}) => {
  const navigate = useNavigate()
  const availableCredit = useStore(s => s.getAvailableCredit())

  if (!reason) return null

  const config = {
    locked: {
      icon: <AlertCircle className="text-red-600" size={40} />,
      title: 'Account Locked',
      message: 'Your account is currently locked due to overdue payments. Please settle your balance to continue shopping.',
      buttonText: 'Go to Dashboard to Pay',
      onClick: () => {
        onClose()
        navigate('/dashboard')
      },
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      btnBg: 'bg-red-600',
    },
    insufficient: {
      icon: <ShieldAlert className="text-amber-600" size={40} />,
      title: 'Insufficient Credit',
      message: `This purchase of ${formatCurrency(price)} exceeds your available credit of ${formatCurrency(availableCredit)}.`,
      buttonText: 'Back to Shop',
      onClick: onClose,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      btnBg: 'bg-amber-600',
    },
    action_required: {
      icon: <AlertTriangle className="text-orange-600" size={40} />,
      title: 'Payment Issue',
      message: 'There is an issue with your primary payment method. Please update your card details to proceed.',
      buttonText: 'Manage Cards',
      onClick: () => {
        onClose()
        navigate('/cards')
      },
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      btnBg: 'bg-orange-600',
    },
  }[reason]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <div className={`w-20 h-20 ${config.iconBg} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
              {config.icon}
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">{config.title}</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {config.message}
            </p>

            <button
              onClick={config.onClick}
              className={`w-full py-4 ${config.btnBg} text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]`}
            >
              <span>{config.buttonText}</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
