import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanSelector } from '../../src/components/checkout/PlanSelector'
import React from 'react'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('PlanSelector Component', () => {
  const mockOnTermSelect = vi.fn()
  const defaultProps = {
    price: 1000,
    selectedTerm: 4,
    onTermSelect: mockOnTermSelect,
  }

  it('renders available terms for the price', () => {
    render(<PlanSelector {...defaultProps} />)
    // For $1000, terms 4, 6, 8 should be available
    expect(screen.getByText('4 Months')).toBeDefined()
    expect(screen.getByText('6 Months')).toBeDefined()
    expect(screen.getByText('8 Months')).toBeDefined()
  })

  it('shows "Free" badge only for term 4', () => {
    render(<PlanSelector {...defaultProps} />)
    const freeBadge = screen.getByText('Free')
    expect(freeBadge).toBeDefined()
    
    // Check that it's associated with 4 Months (simplified check)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0].innerHTML).toContain('Free')
    expect(buttons[1].innerHTML).not.toContain('Free')
  })

  it('calculates and displays fees for extended terms', () => {
    render(<PlanSelector {...defaultProps} />)
    // $1000 at term 6 has a fee (3.98% = $40)
    expect(screen.getByText('+$40 fee')).toBeDefined()
  })

  it('calls onTermSelect when a different term is clicked', () => {
    render(<PlanSelector {...defaultProps} />)
    fireEvent.click(screen.getByText('6 Months'))
    expect(mockOnTermSelect).toHaveBeenCalledWith(6)
  })

  it('displays correct summary for selected term', () => {
    render(<PlanSelector {...defaultProps} selectedTerm={6} />)
    // $1000 / 6 = 166 monthly. Fee = 40. First payment = 166 + 40 = 206
    expect(screen.getByText('$206')).toBeDefined() // First payment
    expect(screen.getByText('$1,040')).toBeDefined() // Total
  })
})
