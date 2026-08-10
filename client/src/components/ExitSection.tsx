import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

type Props = {
  exit: number
  title: string
  tone?: 'dark' | 'light'
  id?: string
  children: ReactNode
  className?: string
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const childVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
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
        <motion.div variants={reduce ? undefined : childVariant} className="mb-12 flex flex-row items-end gap-3 sm:gap-5">
          <div className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-route-yellow whitespace-nowrap mb-1.5 sm:mb-2">
            Exit {String(exit).padStart(2, '0')}
          </div>
          <div className="h-px flex-1 bg-[rgba(212,175,55,0.2)] mb-2.5 sm:mb-3" />
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] text-right">
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

