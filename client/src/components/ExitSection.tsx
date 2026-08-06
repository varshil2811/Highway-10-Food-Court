import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  exit: number
  title: string
  tone?: 'dark' | 'light'
  id?: string
  children: ReactNode
  className?: string
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const childVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

export default function ExitSection({
  exit,
  title,
  tone = 'dark',
  id,
  children,
  className = '',
}: Props) {
  const reduce = useReducedMotion()
  const isAlt = tone === 'light'

  return (
    <motion.section
      id={id}
      variants={reduce ? undefined : staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      className={`relative ${isAlt ? 'bg-surface text-paper-cream' : 'bg-asphalt text-paper-cream'}`}
    >
      <div className={`mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28 md:pl-20 ${className}`}>
        <motion.div variants={reduce ? undefined : childVariant} className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
          <div className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-route-yellow">
            Exit {String(exit).padStart(2, '0')}
          </div>
          <div className="hidden h-px flex-1 bg-[rgba(212,175,55,0.2)] sm:block" />
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        </motion.div>
        <motion.div variants={reduce ? undefined : childVariant}>
          {children}
        </motion.div>
      </div>
    </motion.section>
  )
}

export function useOpenNow() {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      const openStart = 11 * 60
      const openEnd = 1 * 60
      setOpen(mins >= openStart || mins < openEnd)
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  return open
}
