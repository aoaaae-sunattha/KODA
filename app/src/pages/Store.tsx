import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { getAvailableTerms } from '../data/feeRates'
import { useCheckoutGuard } from '../hooks/useCheckoutGuard'
import { CheckoutModal } from '../components/checkout/CheckoutModal'
import { IDVerifyModal } from '../components/checkout/IDVerifyModal'
import { RiskAlertModal, type RiskReason } from '../components/checkout/RiskAlertModal'
import type { Product } from '../data/types'

export default function Store() {
  const { products, currentUser } = useStore()
  const { check } = useCheckoutGuard()
  const navigate = useNavigate()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isIDVerifyOpen, setIsIDVerifyOpen] = useState(false)
  const [riskReason, setRiskReason] = useState<RiskReason | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  if (!currentUser) return null

  const handleBuy = (product: Product) => {
    const status = check(product.price)
    
    if (status === 'allowed') {
      setSelectedProduct(product)
      setIsCheckoutOpen(true)
    } else if (status === 'unverified') {
      setIsIDVerifyOpen(true)
    } else {
      setSelectedProduct(product)
      setRiskReason(status as RiskReason)
    }
  }

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false)
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
      navigate('/dashboard')
    }, 2000)
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
    <div className="min-h-screen pb-32 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-text-primary">
              Curated Essentials
            </h1>
            <p className="text-lg text-text-secondary">
              High-value items, split into interest-free installments.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-500 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Storefront Mockup</span>
          </motion.div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map(product => {
            const terms = getAvailableTerms(product.price)
            const maxTerm = Math.max(...terms)
            
            return (
              <motion.div 
                key={product.id} 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group"
              >
                <div 
                  className="aspect-[4/3] flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500 cursor-pointer overflow-hidden"
                  style={{ background: product.color }}
                  onClick={() => handleBuy(product)}
                >
                  <motion.span
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {product.emoji}
                  </motion.span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {product.brand}
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-text-primary">{product.name}</h3>
                    </div>
                    <span className="text-xl font-bold text-text-primary">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-sm mb-6 flex-1 line-clamp-2 text-text-secondary">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="text-xs font-medium text-text-secondary">
                      Up to <span className="font-bold text-gray-900">{maxTerm} terms</span>
                    </div>
                    <button
                      onClick={() => handleBuy(product)}
                      className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                      Buy with KODA
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <CheckoutModal
        product={selectedProduct}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <IDVerifyModal
        isOpen={isIDVerifyOpen}
        onClose={() => setIsIDVerifyOpen(false)}
      />

      <RiskAlertModal
        isOpen={!!riskReason}
        onClose={() => setRiskReason(null)}
        reason={riskReason}
        price={selectedProduct?.price}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-success text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Order Placed Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
