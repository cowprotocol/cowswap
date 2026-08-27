import { ReactNode } from 'react'

import { useRwaTokenIds } from 'modules/rwa'
import { SwapWidget } from 'modules/swap'

export function RwaWidget(): ReactNode {
  const prioritizedTokenIds = useRwaTokenIds()

  return <SwapWidget prioritizedTokenIds={prioritizedTokenIds} />
}
