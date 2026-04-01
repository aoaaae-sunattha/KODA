import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../src/store/useStore'
import { SEED_PRODUCTS } from '../src/data/seedProducts'

describe('QA Scenario Simulation', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  it('verifies that simulateFailure locks the account and triggers overdue state', () => {
    // 1. Setup: Login as fresh user and create an order
    useStore.getState().login('fresh@koda.test')
    useStore.getState().createOrder(SEED_PRODUCTS[0], 4)
    const orderId = useStore.getState().orders[0].id

    // 2. Action: Simulate Failure
    useStore.getState().simulateFailure(orderId)

    // 3. Assertion: Account should be locked and order overdue
    const state = useStore.getState()
    expect(state.currentUser?.accountStatus).toBe('locked')
    expect(state.currentUser?.overdueAmount).toBeGreaterThan(0)
    expect(state.orders[0].status).toBe('overdue')
  })

  it('verifies that verifyKYC (T-10) activates a new user with credit', () => {
    // 1. Setup: Login as unverified new user
    useStore.getState().login('new@koda.test')
    expect(useStore.getState().currentUser?.verified).toBe(false)
    expect(useStore.getState().getAvailableCredit()).toBe(0)

    // 2. Action: Verify KYC
    useStore.getState().verifyKYC()

    // 3. Assertion: User should be active and have credit
    const user = useStore.getState().currentUser
    expect(user?.verified).toBe(true)
    expect(user?.accountStatus).toBe('active')
    expect(useStore.getState().getAvailableCredit()).toBe(8000)
  })

  it('verifies Card Management CRUD (T-12)', () => {
    useStore.getState().login('fresh@koda.test')
    const initialCount = useStore.getState().cards.length

    // 1. Add Card
    useStore.getState().addCard({
      last4: '9999',
      brand: 'mastercard',
      expiryMonth: 10,
      expiryYear: 2030,
      isPrimary: false
    })
    
    let state = useStore.getState()
    expect(state.cards.length).toBe(initialCount + 1)
    const newCard = state.cards.find(c => c.last4 === '9999')!
    expect(newCard.brand).toBe('mastercard')

    // 2. Set Primary
    useStore.getState().setPrimaryCard(newCard.id)
    state = useStore.getState()
    expect(state.cards.find(c => c.id === newCard.id)?.isPrimary).toBe(true)

    // 3. Remove Card (non-primary)
    const cardToRemove = state.cards.find(c => !c.isPrimary)!
    useStore.getState().removeCard(cardToRemove.id)
    state = useStore.getState()
    expect(state.cards.length).toBe(initialCount)
    expect(state.cards.find(c => c.id === cardToRemove.id)).toBeUndefined()
  })
})
