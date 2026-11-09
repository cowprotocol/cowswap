import { useCallback, useState } from 'react'

import { usePathname } from 'next/navigation'

interface OpenOnPage {
  isOpen: boolean
  open(): void
  close(): void
}

/** Open state tied to the page it opened on: the header outlives navigation, so Back and Forward must close it */
export function useOpenOnPage(): OpenOnPage {
  const pathname = usePathname()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const isOpen = openOn === pathname

  if (openOn !== null && !isOpen) setOpenOn(null)

  const open = useCallback(() => setOpenOn(pathname), [pathname])
  const close = useCallback(() => setOpenOn(null), [])

  return { isOpen, open, close }
}
