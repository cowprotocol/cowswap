import { ReactNode } from 'react'

import { Currency } from '@cowprotocol/currency'
import { useTokenWarnings } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { TokenWarningsBadge } from 'common/pure/TokenWarningsBadge'

export interface TokenWarningsProps {
  currency: Nullish<Currency>
}

export function TokenWarnings({ currency }: TokenWarningsProps): ReactNode {
  const warnings = useTokenWarnings(currency)

  return <TokenWarningsBadge warnings={warnings} />
}
