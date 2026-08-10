import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Logo from './Logo'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function RouteLine() {
  const { scrollYProgress } = useScroll()
  const reduced = usePrefersReducedMotion()
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  })
  const progress = reduced ? scrollYProgress : smooth
  const markerTop = useTransform(progress, [0, 1], ['0%', 'calc(100% - 2rem)'])

  return (
    <>
      <div
        className="pointer-events-none fixed top-28 bottom-10 left-4 z-40 hidden w-10 md:block lg:left-7"
        aria-hidden
      >
        <div data-route-track className="relative mx-auto h-full w-px bg-[rgba(212,175,55,0.2)]">
          <motion.div
            className="absolute inset-x-0 top-0 origin-top bg-route-yellow"
            style={{ scaleY: progress, height: '100%', width: 2, left: -0.5 }}
          />
          <motion.div className="absolute left-1/2 -translate-x-1/2" style={{ top: markerTop }}>
            <Logo className="w-8 h-auto drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]" />
          </motion.div>
        </div>
      </div>

      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent md:hidden" aria-hidden>
        <motion.div className="h-full origin-left bg-route-yellow" style={{ scaleX: progress }} />
      </div>
    </>
  )
}
