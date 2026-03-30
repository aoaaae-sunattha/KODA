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

    const newOrder: Order = {
      id: `ord_${Math.random().toString(36).substr(2, 9)}`,
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

    set(state => ({
      orders: [newOrder, ...state.orders],
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
          if (inst.status === 'paid') continue
          const deducted = Math.min(inst.amount, remaining)
          updatedInstallments[i] = { ...inst, amount: inst.amount - deducted }
          remaining -= deducted
        }
        return {
          ...order,
          refundedAmount: order.refundedAmount + amount,
          total: order.total - amount,
          installments: updatedInstallments,
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
        o.status === 'overdue' ? { ...o, status: 'active' as const } : o
      ),
    }))
  },

  // ─── CARDS ──────────────────────────────────────────────────────────────────
  addCard: (cardData) => {
    const newCard: Card = { ...cardData, id: `card-${Date.now()}` }
    set(state => ({ cards: [...state.cards, newCard] }))
  },

  removeCard: (cardId: string) => {
    set(state => ({ cards: state.cards.filter(c => c.id !== cardId) }))
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
        // o.total is already reduced by refunds in simulateRefund, so don't subtract refundedAmount again
        const paidAmount = o.paidCount > 0
          ? o.firstPayment + (o.paidCount - 1) * o.monthly
          : 0
        return sum + (o.total - paidAmount)
      }, 0)
  },

  getAvailableCredit: () => {
    const { currentUser } = get()
    if (!currentUser) return 0
    return Math.max(0, currentUser.creditLimit - get().getUsedCredit())
  },
}))
