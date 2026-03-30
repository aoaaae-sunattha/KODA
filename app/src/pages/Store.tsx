import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { getAvailableTerms } from '../data/feeRates'
import { useCheckoutGuard } from '../hooks/useCheckoutGuard'
import { CheckoutModal } from '../components/checkout/CheckoutModal'
import type { Product } from '../data/types'

export default function Store() {
  const { products, currentUser } = useStore()
  const { check } = useCheckoutGuard()
  const navigate = useNavigate()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  if (!currentUser) return null

  const handleBuy = (product: Product) => {
    const status = check(product.price)
    if (status === 'allowed') {
      setSelectedProduct(product)
      setIsCheckoutOpen(true)
    } else {
      alert(`Checkout blocked: ${status}. Please check your dashboard.`)
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

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#F5F0EC' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1A1A2E' }}>
              Curated Essentials
            </h1>
            <p className="text-lg" style={{ color: '#6B7280' }}>
              High-value items, split into interest-free installments.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-500 shadow-sm">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Storefront Mockup</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => {
            const terms = getAvailableTerms(product.price)
            const maxTerm = Math.max(...terms)
            
            return (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="aspect-[4/3] flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  style={{ background: product.color }}
                  onClick={() => handleBuy(product)}
                >
                  {product.emoji}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5D5FEF' }}>
                        {product.brand}
                      </span>
                      <h3 className="text-xl font-bold mt-1" style={{ color: '#1A1A2E' }}>{product.name}</h3>
                    </div>
                    <span className="text-xl font-bold" style={{ color: '#1A1A2E' }}>
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-sm mb-6 flex-1 line-clamp-2" style={{ color: '#6B7280' }}>
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                    <div className="text-xs font-medium" style={{ color: '#6B7280' }}>
                      Up to <span className="font-bold text-gray-900">{maxTerm} terms</span>
                    </div>
                    <button 
                      onClick={() => handleBuy(product)}
                      className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                      style={{ backgroundColor: '#5D5FEF' }}
                    >
                      Buy with Anyway
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <CheckoutModal
        product={selectedProduct}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
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
