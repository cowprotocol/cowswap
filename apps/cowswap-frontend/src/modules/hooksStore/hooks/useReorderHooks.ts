import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useHooks } from './useHooks'

import { HooksStoreState, setHooksAtom } from '../state/hookDetailsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReorderHooks(hookType: keyof HooksStoreState) {
  const hooksState = useHooks()
  const hooks = hooksState[hookType]

  const setHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newHooks = [...hooks]
      const [removed] = newHooks.splice(dragIndex, 1)

      newHooks.splice(hoverIndex, 0, removed)
      setHooks((prevState) => ({ ...prevState, [hookType]: newHooks }))
    },
    [hooks, setHooks, hookType],
  )
}
