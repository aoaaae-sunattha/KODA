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
      useStore.getState().login('new@anyway.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('unverified')
    })

    it('blocks locked accounts', () => {
      useStore.getState().login('overdue@anyway.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('locked')
    })

    it('blocks action_required accounts', () => {
      useStore.getState().login('declined@anyway.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(100)).toBe('action_required')
    })

    it('blocks insufficient credit', () => {
      useStore.getState().login('fresh@anyway.test') // Limit $8000
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(9000)).toBe('insufficient')
    })

    it('allows verified, active users with enough credit', () => {
      useStore.getState().login('fresh@anyway.test')
      const { result } = renderHook(() => useCheckoutGuard())
      expect(result.current.check(1000)).toBe('allowed')
    })
  })

  describe('Recovery Logic', () => {
    it('payOverdue() unlocks the account', () => {
      useStore.getState().login('overdue@anyway.test')
      expect(useStore.getState().currentUser?.accountStatus).toBe('locked')
      
      useStore.getState().payOverdue()
      
      expect(useStore.getState().currentUser?.accountStatus).toBe('active')
      expect(useStore.getState().currentUser?.overdueAmount).toBe(0)
    })

    it('verifyKYC() activates user and grants credit', () => {
      useStore.getState().login('new@anyway.test')
      expect(useStore.getState().currentUser?.verified).toBe(false)
      
      useStore.getState().verifyKYC()
      
      const user = useStore.getState().currentUser
      expect(user?.verified).toBe(true)
      expect(user?.accountStatus).toBe('active')
      expect(user?.creditLimit).toBe(8000)
    })
  })
})
