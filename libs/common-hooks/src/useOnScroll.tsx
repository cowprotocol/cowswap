import { RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

export function useOnScroll(node: RefObject<HTMLElement | null>, handler: Command | undefined) {
  const handlerRef = useRef<Command | undefined>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!node.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && handlerRef.current) {
            handlerRef.current()
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '0px',
        root: null,
      },
    )

    observer.observe(node.current)

    return () => {
      observer.disconnect()
    }
  }, [node])
}
