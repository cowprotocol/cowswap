import { RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

export function useOnClickOutside(nodes: RefObject<HTMLElement>[], handler: Command | undefined) {
  const handlerRef = useRef<Command | undefined>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (nodes.some((node) => node.current?.contains(e.target as Node))) {
        return
      }
      if (handlerRef.current) handlerRef.current()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [nodes])
}
