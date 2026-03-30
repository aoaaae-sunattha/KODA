import { useStore } from '../store/useStore'

export type CheckoutGateStatus = 
  | 'allowed' 
  | 'unverified'   // KYC pending
  | 'locked'       // Account locked (overdue)
  | 'insufficient' // Not enough credit
  | 'action_required' // Payment failed or similar

export function useCheckoutGuard() {
  const { currentUser, getAvailableCredit } = useStore()

  const check = (price: number): CheckoutGateStatus => {
    if (!currentUser) return 'unverified'

    // 1. KYC Check (Priority 1 per spec)
    if (!currentUser.verified || currentUser.accountStatus === 'kyc_pending') {
      return 'unverified'
    }

    // 2. Account Lock Check (Priority 2)
    if (currentUser.accountStatus === 'locked') {
      return 'locked'
    }

    // 3. Action Required (Priority 3)
    if (currentUser.accountStatus === 'action_required') {
      return 'action_required'
    }

    // 4. Credit Limit Check (Priority 4)
    const available = getAvailableCredit()
    if (price > available) {
      return 'insufficient'
    }

    return 'allowed'
  }

  return { check }
}
