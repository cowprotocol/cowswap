import { JSX } from 'react'

import { DevTools } from 'jotai-devtools'

export function BalancesDevtools(): JSX.Element | null {
  if (process.env.NODE_ENV !== 'development') return null

  return <DevTools position="bottom-left" />
}
