import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrderCard from '../../../src/components/dashboard/OrderCard'
import { orderA } from '../../../src/data/seedOrders'
import '@testing-library/jest-dom'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
}))

// Mock the store
vi.mock('../../../src/store/useStore', () => ({
  useStore: vi.fn(() => ({
    payInstallment: vi.fn(),
    paySpecificAmount: vi.fn(),
    payFullBalance: vi.fn(),
    simulateFailure: vi.fn(),
  })),
}))

describe('OrderCard Component', () => {
  it('renders order summary and toggle button', () => {
    render(<OrderCard order={orderA} />)
    
    expect(screen.getByText('Sinnerup')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-schedule-btn')).toHaveTextContent('View Schedule')
  })

  it('toggles the payment schedule visibility', () => {
    render(<OrderCard order={orderA} />)
    
    const toggleBtn = screen.getByTestId('toggle-schedule-btn')
    
    // Initially schedule is hidden
    expect(screen.queryByTestId('timeline-card-0')).not.toBeInTheDocument()
    
    // Click to show
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveTextContent('Hide Schedule')
    expect(screen.getByTestId('timeline-card-0')).toBeInTheDocument()
    
    // Click to hide
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveTextContent('View Schedule')
    expect(screen.queryByTestId('timeline-card-0')).not.toBeInTheDocument()
  })
})
