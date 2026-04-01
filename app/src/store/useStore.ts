import { create } from 'zustand'
import type { User, Order, Card, MerchantOrder, Product, Term, Installment } from '../data/types'
import {
  MOCK_USERS, MOCK_ORDERS, MOCK_CARDS, MOCK_MERCHANT_ORDERS,
} from '../data/mockUsers'
import { SEED_PRODUCTS } from '../data/seedProducts'
import { calculatePlan } from '../data/feeRates'
import { addMonths, formatISO } from 'date-fns'

interface AppState {
  // Auth
  currentUser: User | null
  loginError: string | null

  // Data
  orders: Order[]
  cards: Card[]
  merchantOrders: MerchantOrder[]
  products: Product[]

  // Actions
  login: (email: string) => boolean
  logout: () => void

  createOrder: (product: Product, term: Term) => void
  payInstallment: (orderId: string) => void
  simulateRefund: (orderId: string, amount: number) => void
  verifyKYC: () => void
  lockAccount: () => void
  payOverdue: () => void

  simulateFailure: (orderId: string) => void

  addCard: (card: Omit<Card, 'id'>) => void
  removeCard: (cardId: string) => void
  setPrimaryCard: (cardId: string) => void

  // Computed helpers (not stored — derive from orders)
  getUsedCredit: () => number
  getAvailableCredit: () => number
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  loginError: null,
  orders: [],
  cards: [],
  merchantOrders: [],
  products: SEED_PRODUCTS,

  // ─── AUTH ───────────────────────────────────────────────────────────────────
  login: (email: string) => {
    const key = email.toLowerCase().trim()
    const user = MOCK_USERS[key]
    if (!user) {
      set({ loginError: 'No account found for this email.' })
      return false
    }
    set({
      currentUser: user,
      loginError: null,
      orders: MOCK_ORDERS[key] ?? [],
      cards: MOCK_CARDS[key] ?? [],
      merchantOrders: user.role === 'merchant' ? MOCK_MERCHANT_ORDERS : [],
    })
    return true
  },

  logout: () => set({
    currentUser: null, orders: [], cards: [], merchantOrders: [], loginError: null,
  }),

  // ─── CREATE ORDER ───────────────────────────────────────────────────────────
  createOrder: (product: Product, term: Term) => {
    const plan = calculatePlan(product.price, term)
    const purchaseDate = new Date()

    const installments: Installment[] = plan.installments.map((amount, i) => ({
      index: i,
      amount,
      dueDate: formatISO(addMonths(purchaseDate, i)),
      status: i === 0 ? 'paid' : 'upcoming', // First installment paid at checkout
    }))

    const orderId = `ord_${Math.random().toString(36).substr(2, 9)}`
    const newOrder: Order = {
      id: orderId,
      merchant: product.brand,
      merchantCategory: product.category,
      purchaseDate: formatISO(purchaseDate),
      principal: product.price,
      term,
      fee: plan.fee,
      monthly: plan.monthly,
      firstPayment: plan.firstPayment,
      total: plan.total,
      paidCount: 1, // First one paid immediately
      refundedAmount: 0,
      status: 'active',
      installments,
    }

    // Generate corresponding MerchantOrder
    const commission = Math.round(product.price * 0.025 * 100) / 100
    const newMerchantOrder: MerchantOrder = {
      id: `m_${Math.random().toString(36).substr(2, 9)}`,
      orderId: `#${orderId.slice(-4).toUpperCase()}`,
      amount: product.price,
      commission,
      payout: product.price - commission,
      status: 'pending',
      date: formatISO(purchaseDate),
    }

    set(state => ({
      orders: [newOrder, ...state.orders],
      merchantOrders: [newMerchantOrder, ...state.merchantOrders],
    }))
  },

  settleOrder: (merchantOrderId: string) => {
    set(state => ({
      merchantOrders: state.merchantOrders.map(o =>
        o.id === merchantOrderId ? { ...o, status: 'settled' as const } : o
      ),
    }))
  },

  // ─── PAY NEXT INSTALLMENT ──────────────────────────────────────────────────
  payInstallment: (orderId: string) => {
    set(state => ({
      orders: state.orders.map(order => {
        if (order.id !== orderId) return order
        const nextUnpaid = order.installments.findIndex(i => i.status !== 'paid')
        if (nextUnpaid === -1) return order
        const updatedInstallments = order.installments.map((inst, i) =>
          i === nextUnpaid ? { ...inst, status: 'paid' as const } : inst
        )
        const newPaidCount = order.paidCount + 1
        const allPaid = newPaidCount === order.term
        return {
          ...order,
          paidCount: newPaidCount,
          status: allPaid ? 'completed' as const : 'active' as const,
          installments: updatedInstallments,
        }
      }),
    }))
  },

  // ─── SIMULATE REFUND ───────────────────────────────────────────────────────
  simulateRefund: (orderId: string, amount: number) => {
    set(state => ({
      orders: state.orders.map(order => {
        if (order.id !== orderId) return order
        
        // Apply refund to last unpaid installment first, then work backwards
        let remaining = amount
        const updatedInstallments = [...order.installments]
        
        for (let i = updatedInstallments.length - 1; i >= 0 && remaining > 0; i--) {
          const inst = updatedInstallments[i]
          if (inst.status === 'paid') continue // Spec: refund only unpaid installments
          
          const deductable = Math.min(inst.amount, remaining)
          updatedInstallments[i] = { ...inst, amount: inst.amount - deductable }
          remaining -= deductable
        }

        const newTotal = order.total - (amount - remaining)
        const allSettled = updatedInstallments.every(i => i.status === 'paid' || i.amount === 0)

        return {
          ...order,
          refundedAmount: order.refundedAmount + (amount - remaining),
          total: newTotal,
          installments: updatedInstallments,
          status: allSettled ? 'completed' : order.status,
        }
      }),
    }))
  },

  // ─── KYC ────────────────────────────────────────────────────────────────────
  verifyKYC: () => {
    set(state => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, verified: true, accountStatus: 'active', creditLimit: 8000 }
        : null,
    }))
  },

  // ─── ACCOUNT LOCKING ────────────────────────────────────────────────────────
  lockAccount: () => {
    set(state => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, accountStatus: 'locked' }
        : null,
    }))
  },

  payOverdue: () => {
    set(state => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, accountStatus: 'active', overdueAmount: 0 }
        : null,
      orders: state.orders.map(o =>
        o.status === 'overdue' ? {
          ...o,
          status: 'active' as const,
          paidCount: o.paidCount + 1,
          installments: o.installments.map(inst =>
            inst.status === 'overdue' ? { ...inst, status: 'paid' as const } : inst
          ),
        } : o
      ),
    }))
  },

  simulateFailure: (orderId: string) => {
    const order = get().orders.find(o => o.id === orderId)
    if (!order) return

    const nextUnpaid = order.installments.find(i => i.status !== 'paid')
    const amount = nextUnpaid ? nextUnpaid.amount : 0

    const nextIndex = nextUnpaid ? nextUnpaid.index : -1

    set(state => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, accountStatus: 'locked' as const, overdueAmount: amount }
        : null,
      orders: state.orders.map(o =>
        o.id === orderId ? {
          ...o,
          status: 'overdue' as const,
          installments: o.installments.map((inst, i) =>
            i === nextIndex ? { ...inst, status: 'overdue' as const } : inst
          ),
        } : o
      ),
    }))
  },

  // ─── CARDS ──────────────────────────────────────────────────────────────────
  addCard: (cardData) => {
    set(state => {
      const isPrimary = state.cards.length === 0 ? true : cardData.isPrimary
      const newCard: Card = { 
        ...cardData, 
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isPrimary 
      }
      return { cards: [...state.cards, newCard] }
    })
  },

  removeCard: (cardId: string) => {
    set(state => {
      const card = state.cards.find(c => c.id === cardId)
      if (card?.isPrimary) return state // Cannot remove primary card
      return { cards: state.cards.filter(c => c.id !== cardId) }
    })
  },

  setPrimaryCard: (cardId: string) => {
    set(state => ({
      cards: state.cards.map(c => ({ ...c, isPrimary: c.id === cardId })),
    }))
  },

  // ─── COMPUTED ───────────────────────────────────────────────────────────────
  getUsedCredit: () => {
    const { orders } = get()
    return orders
      .filter(o => o.status !== 'completed')
      .reduce((sum, o) => {
        const paidAmount = o.installments
          .filter(i => i.status === 'paid')
          .reduce((s, i) => s + i.amount, 0)
        return sum + (o.total - paidAmount)
      }, 0)
  },

  getAvailableCredit: () => {
    const { currentUser } = get()
    if (!currentUser) return 0
    return Math.max(0, currentUser.creditLimit - get().getUsedCredit())
  },
}))
