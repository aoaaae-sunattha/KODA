import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../src/store/useStore'

describe('Card Management (Phase 6)', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  it('automatically sets the first added card as primary', () => {
    const store = useStore.getState()
    
    store.addCard({
      last4: '1111',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2028,
      isPrimary: false, // Should be overridden to true
    })

    const state = useStore.getState()
    expect(state.cards).toHaveLength(1)
    expect(state.cards[0].last4).toBe('1111')
    expect(state.cards[0].isPrimary).toBe(true)
  })

  it('allows adding multiple cards and setting a new primary', () => {
    const store = useStore.getState()
    
    // First card (primary)
    store.addCard({
      last4: '1111',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2028,
      isPrimary: false,
    })

    // Second card
    store.addCard({
      last4: '2222',
      brand: 'mastercard',
      expiryMonth: 10,
      expiryYear: 2029,
      isPrimary: false,
    })

    let state = useStore.getState()
    expect(state.cards).toHaveLength(2)
    expect(state.cards.find(c => c.last4 === '1111')?.isPrimary).toBe(true)
    expect(state.cards.find(c => c.last4 === '2222')?.isPrimary).toBe(false)

    // Set second card as primary
    const secondCardId = state.cards.find(c => c.last4 === '2222')!.id
    useStore.getState().setPrimaryCard(secondCardId)

    state = useStore.getState()
    expect(state.cards.find(c => c.last4 === '1111')?.isPrimary).toBe(false)
    expect(state.cards.find(c => c.last4 === '2222')?.isPrimary).toBe(true)
  })

  it('prevents removal of the primary card when other cards exist', () => {
    const store = useStore.getState()

    store.addCard({ last4: '1111', brand: 'visa', expiryMonth: 12, expiryYear: 2028, isPrimary: true })
    store.addCard({ last4: '2222', brand: 'mastercard', expiryMonth: 10, expiryYear: 2029, isPrimary: false })

    const primaryId = useStore.getState().cards.find(c => c.isPrimary)!.id
    useStore.getState().removeCard(primaryId)

    const state = useStore.getState()
    expect(state.cards).toHaveLength(2) // Not removed
    expect(state.cards.find(c => c.id === primaryId)).toBeDefined()
  })

  it('allows removal of the primary card when it is the only card', () => {
    const store = useStore.getState()

    store.addCard({ last4: '1111', brand: 'visa', expiryMonth: 12, expiryYear: 2028, isPrimary: true })

    const cardId = useStore.getState().cards[0].id
    useStore.getState().removeCard(cardId)

    expect(useStore.getState().cards).toHaveLength(0)
  })

  it('allows removal of non-primary cards', () => {
    const store = useStore.getState()
    
    store.addCard({ last4: '1111', brand: 'visa', expiryMonth: 12, expiryYear: 2028, isPrimary: true })
    store.addCard({ last4: '2222', brand: 'mastercard', expiryMonth: 10, expiryYear: 2029, isPrimary: false })

    let state = useStore.getState()
    expect(state.cards).toHaveLength(2)

    const secondCardId = state.cards.find(c => c.last4 === '2222')!.id
    useStore.getState().removeCard(secondCardId)

    state = useStore.getState()
    expect(state.cards).toHaveLength(1)
    expect(state.cards.find(c => c.last4 === '2222')).toBeUndefined()
  })
})
