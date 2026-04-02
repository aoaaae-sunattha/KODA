import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStore } from '../src/store/useStore'
import { useCheckoutGuard } from '../src/hooks/useCheckoutGuard'
import { SEED_PRODUCTS } from '../src/data/seedProducts'

describe('Risk & Error States (Phase 5)', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  describe('useCheckoutGuard Logic', () => {
    it('blocks unverified users', () => {
      useStore.getState().login('new@koda.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('unverified')
    })

    it('blocks locked accounts', () => {
      useStore.getState().login('overdue@koda.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('locked')
    })

    it('blocks action_required accounts', () => {
      useStore.getState().login('declined@koda.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('action_required')
    })

    it('blocks insufficient credit', () => {
      useStore.getState().login('fresh@koda.test') // Limit $8000
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(9000)).toBe('insufficient')
    })

    it('allows verified, active users with enough credit', () => {
      useStore.getState().login('fresh@koda.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(1000)).toBe('allowed')
    })
  })

  describe('Recovery Logic', () => {
    it('payOverdue() unlocks the account', () => {
      useStore.getState().login('overdue@koda.test')
      expect(useStore.getState().currentUser?.accountStatus).toBe('locked')
      
      useStore.getState().payOverdue()
      
      expect(useStore.getState().currentUser?.accountStatus).toBe('active')
      expect(useStore.getState().currentUser?.overdueAmount).toBe(0)
    })

    it('simulateFailure + payOverdue round-trip resolves overdue installment', () => {
      useStore.getState().login('fresh@koda.test')

      // Create an order and simulate failure
      const product = { ...SEED_PRODUCTS[0], price: 1000 }
      useStore.getState().createOrder(product as any, 4)
      const orderId = useStore.getState().orders[0].id

      useStore.getState().simulateFailure(orderId)

      // Verify: account locked, order overdue, installment marked overdue
      let state = useStore.getState()
      expect(state.currentUser?.accountStatus).toBe('locked')
      expect(state.currentUser?.overdueAmount).toBe(250)
      expect(state.orders[0].status).toBe('overdue')
      expect(state.orders[0].installments[1].status).toBe('overdue')

      // Pay overdue: account unlocked, installment marked paid
      useStore.getState().payOverdue()

      state = useStore.getState()
      expect(state.currentUser?.accountStatus).toBe('active')
      expect(state.currentUser?.overdueAmount).toBe(0)
      expect(state.orders[0].status).toBe('active')
      expect(state.orders[0].installments[1].status).toBe('paid')
      expect(state.orders[0].paidCount).toBe(2)
    })

    it('verifyKYC() activates user and grants credit', () => {
      useStore.getState().login('new@koda.test')
      expect(useStore.getState().currentUser?.verified).toBe(false)
      
      useStore.getState().verifyKYC()
      
      const user = useStore.getState().currentUser
      expect(user?.verified).toBe(true)
      expect(user?.accountStatus).toBe('active')
      expect(user?.creditLimit).toBe(8000)
    })
  })
})
