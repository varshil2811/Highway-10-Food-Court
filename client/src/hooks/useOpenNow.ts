import { useState, useEffect } from 'react'

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
