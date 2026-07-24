import { JSX } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { DevTools } from 'jotai-devtools'

export function BalancesDevtools(): JSX.Element | null {
  if (process.env.NODE_ENV !== 'development' || isInjectedWidget()) return null

  return <DevTools position="bottom-left" />
}
