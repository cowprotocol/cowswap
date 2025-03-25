import { RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

const DEFAULT_CONFIG: IntersectionObserverInit = {
  threshold: 0.1, // Fire when just 10% of the element is out of view
  rootMargin: '0px',
  root: null,
}

export function useOnScroll(
  node: RefObject<HTMLElement | null>,
  handler: Command | undefined,
  config: IntersectionObserverInit = DEFAULT_CONFIG,
) {
  const handlerRef = useRef<Command | undefined>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!node.current) return

    const currentNode = node.current

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && handlerRef.current) {
          handlerRef.current()
        }
      })
    }, config)

    observer.observe(currentNode)

    return () => {
      observer.disconnect()
    }
  }, [node, config])
}
