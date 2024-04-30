import { useCallback, useState } from 'react'

import { Command } from '@cowprotocol/types'

export function useToggle(initialState = false): [boolean, Command] {
  const [state, setState] = useState(initialState)
  const toggle = useCallback(() => setState((state) => !state), [])
  return [state, toggle]
}
