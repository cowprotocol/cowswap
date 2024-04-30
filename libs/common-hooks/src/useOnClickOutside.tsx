import { RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

export function useOnClickOutside<T extends HTMLElement>(node: RefObject<T | undefined>, handler: Command | undefined) {
  const handlerRef = useRef<Command | undefined>(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (node.current?.contains(e.target as Node) ?? false) {
        return
      }
      if (handlerRef.current) handlerRef.current()
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [node])
}
