import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanSelector } from '../../../src/components/checkout/PlanSelector'
import type { Term } from '../../../src/data/types'
import React from 'react'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
}))

describe('PlanSelector Component', () => {
  const mockOnTermSelect = vi.fn()
  const defaultProps = {
    price: 20000, // High enough to unlock all terms (including term 24 threshold 15000)
    selectedTerm: 4 as Term,
    onTermSelect: mockOnTermSelect,
  }

  beforeEach(() => {
    mockOnTermSelect.mockClear()
  })

  it('renders primary terms (4, 10, 18, 24) by default', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-option-4')).toBeDefined()
    expect(screen.getByTestId('plan-option-10')).toBeDefined()
    expect(screen.getByTestId('plan-option-18')).toBeDefined()
    expect(screen.getByTestId('plan-option-24')).toBeDefined()
  })

  it('hides secondary terms (6, 8, 12) by default', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.queryByTestId('plan-option-6')).toBeNull()
    expect(screen.queryByTestId('plan-option-8')).toBeNull()
    expect(screen.queryByTestId('plan-option-12')).toBeNull()
  })

  it('shows secondary terms after clicking "+ other options!"', () => {
    render(<PlanSelector {...defaultProps} />)
    fireEvent.click(screen.getByTestId('expand-other-options'))
    expect(screen.getByTestId('plan-option-6')).toBeDefined()
    expect(screen.getByTestId('plan-option-8')).toBeDefined()
    expect(screen.getByTestId('plan-option-12')).toBeDefined()
  })

  it('shows "free" badge on term 4', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-badge-free')).toBeDefined()
  })

  it('shows "most flexible" badge on term 24', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-badge-flexible')).toBeDefined()
  })

  it('calls onTermSelect when a term is clicked', () => {
    render(<PlanSelector {...defaultProps} />)
    fireEvent.click(screen.getByTestId('plan-option-10'))
    expect(mockOnTermSelect).toHaveBeenCalledWith(10)
  })

  it('disables terms above price threshold', () => {
    render(<PlanSelector {...{ ...defaultProps, price: 500 }} />)
    // $500 only qualifies for term 4 (threshold 300)
    // term 10 threshold is 2000, should be disabled
    const term10 = screen.getByTestId('plan-option-10')
    expect(term10.getAttribute('disabled')).not.toBeNull()
  })
})
