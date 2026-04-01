import { useEffect } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'
import { formatCurrency } from '../../utils/format'

interface CounterProps {
  value: number
  isCurrency?: boolean
  duration?: number
  className?: string
}

export default function Counter({ value, isCurrency = true, duration = 0.8, className = '' }: CounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    if (isCurrency) return formatCurrency(latest)
    return Math.round(latest).toLocaleString()
  })

  useEffect(() => {
    const controls = animate(count, value, { 
      duration,
      ease: [0.16, 1, 0.3, 1] // Custom quintic ease-out
    })
    return controls.stop
  }, [value, count, duration])

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  )
}
