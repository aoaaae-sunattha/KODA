import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../src/store/useStore'
import { SEED_PRODUCTS } from '../../src/data/seedProducts'
import type { Product } from '../../src/data/types'

describe('Refund Engine (Phase 4)', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  it('correctly handles a partial refund (backward reconciliation)', () => {
    useStore.getState().login('fresh@koda.test')
    
    // 1. Create order for $1000, 4 installments ($250 each)
    // Actually $999 iPhone / 4 = $249, $249, $249, $252
    const product: Product = { ...SEED_PRODUCTS[0], price: 1000 }
    useStore.getState().createOrder(product, 4)
    const orderId = useStore.getState().orders[0].id
    
    // Initial state: first installment paid, 3 upcoming ($250 each)
    let order = useStore.getState().orders[0]
    expect(order.total).toBe(1000)
    expect(order.installments[3].amount).toBe(250)
    
    // 2. Refund $100
    useStore.getState().simulateRefund(orderId, 100)
    
    // 3. Verify: last installment should be $150
    order = useStore.getState().orders[0]
    expect(order.total).toBe(900)
    expect(order.refundedAmount).toBe(100)
    expect(order.installments[3].amount).toBe(150)
    expect(order.installments[2].amount).toBe(250)
  })

  it('correctly spills over multiple installments during a large refund', () => {
    useStore.getState().login('fresh@koda.test')
    
    const product: Product = { ...SEED_PRODUCTS[0], price: 1000 }
    useStore.getState().createOrder(product, 4)
    const orderId = useStore.getState().orders[0].id
    
    // Refund $600
    // Last installment (4th): $250 -> $0. Remaining refund: $350
    // 3rd installment: $250 -> $0. Remaining refund: $100
    // 2nd installment: $250 -> $150. Remaining refund: $0
    useStore.getState().simulateRefund(orderId, 600)
    
    const order = useStore.getState().orders[0]
    expect(order.total).toBe(400)
    expect(order.refundedAmount).toBe(600)
    expect(order.installments[3].amount).toBe(0)
    expect(order.installments[2].amount).toBe(0)
    expect(order.installments[1].amount).toBe(150)
    expect(order.installments[0].amount).toBe(250) // Paid, should not be touched
  })

  it('marks order as completed after a full refund of unpaid installments', () => {
    useStore.getState().login('fresh@koda.test')
    
    const product: Product = { ...SEED_PRODUCTS[0], price: 1000 }
    useStore.getState().createOrder(product, 4)
    const orderId = useStore.getState().orders[0].id
    
    // Max refundable is $750 (installments 1, 2, 3)
    useStore.getState().simulateRefund(orderId, 750)
    
    const order = useStore.getState().orders[0]
    expect(order.total).toBe(250) // Only the first paid installment remains
    expect(order.status).toBe('completed')
    expect(order.installments.every(i => i.status === 'paid' || i.amount === 0)).toBe(true)
  })

  it('refuses to refund more than the unpaid balance', () => {
    useStore.getState().login('fresh@koda.test')
    
    const product: Product = { ...SEED_PRODUCTS[0], price: 1000 }
    useStore.getState().createOrder(product, 4)
    const orderId = useStore.getState().orders[0].id
    
    // Attempt to refund $1000 (only $750 is unpaid)
    useStore.getState().simulateRefund(orderId, 1000)
    
    const order = useStore.getState().orders[0]
    expect(order.refundedAmount).toBe(750)
    expect(order.total).toBe(250)
  })

  it('TC-RFND-006: skips paid installments when applying refunds (Logic/Edge)', () => {
    useStore.getState().login('fresh@koda.test')
    
    // Order for $1000, 4 installments ($250 each)
    const product: Product = { ...SEED_PRODUCTS[0], price: 1000 }
    useStore.getState().createOrder(product, 4)
    const orderId = useStore.getState().orders[0].id
    
    // Manually set installment #3 (Last) as PAID to simulate early payment
    // Unpaid: #1 ($250), #2 ($250). Paid: #0 ($250), #3 ($250).
    useStore.getState().orders[0].installments[3].status = 'paid'
    
    // Apply refund of $300
    // Logic should skip #3, deduct from #2 ($250) and then #1 ($50)
    useStore.getState().simulateRefund(orderId, 300)
    
    const order = useStore.getState().orders[0]
    expect(order.refundedAmount).toBe(300)
    expect(order.installments[3].amount).toBe(250) // Skipped because PAID
    expect(order.installments[2].amount).toBe(0)   // $250 - 250 = 0
    expect(order.installments[1].amount).toBe(200) // $250 - 50 = 200
  })
})
