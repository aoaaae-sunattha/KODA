import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCheckoutGuard } from '../../../src/hooks/useCheckoutGuard'
import { useStore } from '../../../src/store/useStore'

// Mock the store
vi.mock('../../../src/store/useStore', () => ({
  useStore: vi.fn(),
}))

describe('useCheckoutGuard Hook', () => {
  const mockGetAvailableCredit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useStore as any).mockReturnValue({
      currentUser: null,
      getAvailableCredit: mockGetAvailableCredit,
    })
  })

  it('returns unverified if no user is logged in', () => {
    const { check } = useCheckoutGuard()
    expect(check(100)).toBe('unverified')
  })

  it('returns unverified if user is not verified (KYC check is priority 1)', () => {
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'active', verified: false },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(100)).toBe('unverified')
  })

  it('returns unverified for kyc_pending status', () => {
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'kyc_pending', verified: false },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(100)).toBe('unverified')
  })

  it('returns locked if accountStatus is locked (priority 2, after KYC)', () => {
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'locked', verified: true },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(100)).toBe('locked')
  })

  it('returns action_required if accountStatus is action_required', () => {
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'action_required', verified: true },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(100)).toBe('action_required')
  })

  it('returns insufficient if price exceeds available credit', () => {
    mockGetAvailableCredit.mockReturnValue(500)
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'active', verified: true },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(1000)).toBe('insufficient')
  })

  it('returns allowed if all conditions are met', () => {
    mockGetAvailableCredit.mockReturnValue(5000)
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'active', verified: true },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    expect(check(1000)).toBe('allowed')
  })

  it('KYC check takes priority over locked status per spec', () => {
    ;(useStore as any).mockReturnValue({
      currentUser: { accountStatus: 'locked', verified: false },
      getAvailableCredit: mockGetAvailableCredit,
    })
    const { check } = useCheckoutGuard()
    // Per spec: KYC check comes before lock check
    expect(check(100)).toBe('unverified')
  })
})
