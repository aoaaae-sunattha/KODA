import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentModal } from '../../../src/components/dashboard/PaymentModal'
import type { Order } from '../../../src/data/types'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

const mockOrder: Order = {
  id: 'test-order-1',
  merchant: 'TestShop',
  merchantCategory: 'Electronics',
  purchaseDate: '2026-01-01',
  principal: 1000,
  term: 4,
  fee: 0,
  monthly: 250,
  firstPayment: 250,
  total: 1000,
  paidCount: 1,
  refundedAmount: 0,
  status: 'active',
  installments: [
    { index: 0, amount: 250, dueDate: '2026-01-01', status: 'paid' },
    { index: 1, amount: 250, dueDate: '2026-02-01', status: 'upcoming' },
    { index: 2, amount: 250, dueDate: '2026-03-01', status: 'upcoming' },
    { index: 3, amount: 250, dueDate: '2026-04-01', status: 'upcoming' },
  ],
}

describe('PaymentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnConfirm.mockClear()
  })

  const renderModal = (order = mockOrder) =>
    render(
      <PaymentModal
        order={order}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

  it('renders the modal with all 3 payment options', () => {
    renderModal()
    expect(screen.getByTestId('payment-modal')).toBeDefined()
    expect(screen.getByTestId('payment-option-next')).toBeDefined()
    expect(screen.getByTestId('payment-option-specific')).toBeDefined()
    expect(screen.getByTestId('payment-option-full')).toBeDefined()
  })

  it('selects "Pay my next installment" by default', () => {
    renderModal()
    const radio = screen.getByTestId('payment-option-next').querySelector('input[type="radio"]')
    expect((radio as HTMLInputElement).checked).toBe(true)
  })

  it('shows next installment amount for "next" option', () => {
    renderModal()
    expect(screen.getByText('$250')).toBeDefined()
  })

  it('shows remaining balance for "full" option', () => {
    renderModal()
    // Remaining = 3 * $250 = $750
    expect(screen.getByText('$750')).toBeDefined()
  })

  it('reveals amount input when "specific" option selected', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    expect(screen.getByTestId('specific-amount-input')).toBeDefined()
  })

  it('calls onConfirm with "next" type and amount', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('next', 250)
  })

  it('calls onConfirm with "full" type and remaining balance', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-full'))
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('full', 750)
  })

  it('calls onConfirm with "specific" type and entered amount', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '100' } })
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('specific', 100)
  })

  it('disables confirm button when specific amount is invalid', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '0' } })
    const btn = screen.getByTestId('confirm-payment-btn')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('disables confirm button when specific amount exceeds remaining balance', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '1000' } })
    const btn = screen.getByTestId('confirm-payment-btn')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('calls onClose when cancel button is clicked', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('cancel-payment-btn'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
