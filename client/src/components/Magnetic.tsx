import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion, useSpring } from 'framer-motion'

type Props = {
  children: ReactNode
  className?: string
  strength?: number
}

export default function Magnetic({ children, className = '', strength = 0.25 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current || !isHovered) return

      const { clientX, clientY } = e
      const { height, width, left, top } = ref.current.getBoundingClientRect()
      
      const middleX = clientX - (left + width / 2)
      const middleY = clientY - (top + height / 2)
      
      x.set(middleX * strength)
      y.set(middleY * strength)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      x.set(0)
      y.set(0)
    }

    const element = ref.current
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseleave', handleMouseLeave)
      element.addEventListener('mouseenter', () => setIsHovered(true))
      
      return () => {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseleave', handleMouseLeave)
        element.removeEventListener('mouseenter', () => setIsHovered(true))
      }
    }
  }, [isHovered, x, y, strength])

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}
