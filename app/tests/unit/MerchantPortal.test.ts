import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../src/store/useStore'
import { SEED_PRODUCTS } from '../src/data/seedProducts'

describe('Merchant Portal (Phase 7)', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  it('correctly calculates commission and payout for a new order', () => {
    // 1. Setup: Login as shopper and create order
    useStore.getState().login('fresh@koda.test')
    const product = SEED_PRODUCTS[0] // iPhone 15 Pro, $999
    
    useStore.getState().createOrder(product, 4)
    
    // 2. Verify: MerchantOrder was created with 2.5% fee
    const state = useStore.getState()
    const mOrder = state.merchantOrders[0]
    
    expect(mOrder.amount).toBe(999)
    // 999 * 0.025 = 24.975 -> rounded to 24.98
    expect(mOrder.commission).toBe(24.98)
    expect(mOrder.payout).toBe(999 - 24.98)
    expect(mOrder.status).toBe('pending')
  })

  it('correctly sums settled payouts in totalSettled calculation', () => {
    // 1. Setup: Login as merchant
    useStore.getState().login('merchant@koda.test')
    let state = useStore.getState()
    
    // MOCK_MERCHANT_ORDERS has:
    // m1: $1000, $25 commission, $975 payout (settled)
    // m2: $2400, $60 commission, $2340 payout (settled)
    // m3: $3000, $75 commission, $2925 payout (pending)
    // m4: $5000, $125 commission, $4875 payout (held)
    // Total settled = 975 + 2340 = 3315
    
    // 2. Action: Settle m3
    const m3 = state.merchantOrders.find(o => o.id === 'm3')!
    useStore.getState().settleOrder(m3.id)
    
    // 3. Verify: New total settled = 3315 + 2925 = 6240
    state = useStore.getState()
    const totalSettled = state.merchantOrders
      .filter(o => o.status === 'settled')
      .reduce((s, o) => s + o.payout, 0)
      
    expect(totalSettled).toBe(6240)
  })

  it('real-time integration: shopper purchase appears in merchant list', () => {
    // 1. Shopper buys something
    useStore.getState().login('fresh@koda.test')
    useStore.getState().createOrder(SEED_PRODUCTS[1], 6) // MacBook Pro, $2499
    
    // 2. Check merchant list (still logged in as shopper, but merchantOrders is global)
    const state = useStore.getState()
    expect(state.merchantOrders).toHaveLength(1)
    expect(state.merchantOrders[0].amount).toBe(2499)
    expect(state.merchantOrders[0].status).toBe('pending')
  })
})
