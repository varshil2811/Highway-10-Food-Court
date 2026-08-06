import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()

  // Spring animation configs for buttery smooth cursor movement
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorX = useSpring(-100, springConfig)
  const cursorY = useSpring(-100, springConfig)

  useEffect(() => {
    // Only show custom cursor on desktop devices that support hover
    if (window.matchMedia('(pointer: coarse)').matches) return
    setIsVisible(true)

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleHoverStart = () => setIsHovered(true)
    const handleHoverEnd = () => setIsHovered(false)

    // Attach listeners to interactive elements
    const attachListeners = () => {
      const interactables = document.querySelectorAll('a, button, input, select, textarea, [role="button"]')
      interactables.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart)
        el.addEventListener('mouseleave', handleHoverEnd)
      })
    }

    // Run initially and whenever location changes to attach to new elements
    attachListeners()

    window.addEventListener('mousemove', moveCursor)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      const interactables = document.querySelectorAll('a, button, input, select, textarea, [role="button"]')
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart)
        el.removeEventListener('mouseleave', handleHoverEnd)
      })
    }
  }, [cursorX, cursorY, location.pathname])

  if (!isVisible) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        scale: isHovered ? 3.5 : 1,
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(212, 175, 55, 1)',
        opacity: 1
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        backgroundColor: { duration: 0.2 }
      }}
    />
  )
}
