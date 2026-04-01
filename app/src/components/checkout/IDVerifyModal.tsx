import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface IDVerifyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const IDVerifyModal: React.FC<IDVerifyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'intro' | 'scanning' | 'success'>('intro')
  const [progress, setProgress] = useState(0)
  const verifyKYC = useStore(s => s.verifyKYC)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('intro')
      setProgress(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (step === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep('success'), 500)
            return 100
          }
          return prev + 2
        })
      }, 30)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleStart = () => setStep('scanning')

  const handleFinish = () => {
    verifyKYC()
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
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
          >
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Identity Verify</h2>
                <p className="text-sm text-slate-500 mb-8">
                  We need to verify your identity to establish your <strong>$8,000</strong> credit limit.
                </p>
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Start Verification
                </button>
              </motion.div>
            )}

            {step === 'scanning' && (
              <div className="py-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative overflow-hidden">
                  <motion.div 
                    animate={{ y: [-20, 20, -20] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                  />
                  <ShieldCheck size={32} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">Scanning ID Document...</h3>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Processing Biometrics
                </p>
              </div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Verified!</h2>
                <p className="text-sm text-slate-500 mb-8">
                  Your account is now active. You have been granted a <strong>$8,000 credit limit</strong>.
                </p>
                <button
                  onClick={handleFinish}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
