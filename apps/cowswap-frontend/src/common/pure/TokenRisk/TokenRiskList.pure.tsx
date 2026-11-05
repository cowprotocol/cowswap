import { ReactNode } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './TokenRisk.styled'
import { getRiskCountSummary } from './TokenRisk.utils'
import { TokenRiskItem } from './TokenRiskItem.pure'
import { useTokenRiskCopy } from './useTokenRiskCopy'

export interface TokenRiskListProps {
  warnings: TokenWarning[]
  symbol: string
}

export function TokenRiskList({ warnings, symbol }: TokenRiskListProps): ReactNode {
  const getCopy = useTokenRiskCopy(symbol)
  const summary = getRiskCountSummary(warnings)

  const serious = warnings.filter((warning) => warning.tier === 'serious')
  const worthKnowing = warnings.filter((warning) => warning.tier === 'worthKnowing')

  return (
    <styledEl.Section>
      <styledEl.SectionTitle>{summary}</styledEl.SectionTitle>
      <styledEl.RiskList>
        {serious.length > 0 && (
          <>
            <styledEl.TierLabel>
              <Trans>Serious</Trans>
            </styledEl.TierLabel>
            {serious.map((warning) => (
              <TokenRiskItem key={warning.code} warning={warning} copy={getCopy(warning)} />
            ))}
          </>
        )}
        {worthKnowing.length > 0 && (
          <>
            <styledEl.TierLabel>
              <Trans>Worth knowing</Trans>
            </styledEl.TierLabel>
            {worthKnowing.map((warning) => (
              <TokenRiskItem key={warning.code} warning={warning} copy={getCopy(warning)} />
            ))}
          </>
        )}
      </styledEl.RiskList>
    </styledEl.Section>
  )
}
