import { RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOnClickOutside(nodes: RefObject<HTMLElement | null>[], handler: Command | undefined) {
  const handlerRef = useRef<Command | undefined>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
