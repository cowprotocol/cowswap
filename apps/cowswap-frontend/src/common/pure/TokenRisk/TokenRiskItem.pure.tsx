import { ReactNode } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'

import { getRiskIcon } from './TokenRisk.constants'
import * as styledEl from './TokenRisk.styled'
import { TokenRiskCopy } from './useTokenRiskCopy'

export interface TokenRiskItemProps {
  warning: TokenWarning
  copy: TokenRiskCopy
}

export function TokenRiskItem({ warning, copy }: TokenRiskItemProps): ReactNode {
  return (
    <styledEl.RiskRow>
      <styledEl.IconWell tier={warning.tier}>{getRiskIcon(warning.code)}</styledEl.IconWell>
      <styledEl.RiskCopy>
        <styledEl.RiskTitle>{copy.title}</styledEl.RiskTitle>
        {copy.description && <styledEl.RiskDescription>{copy.description}</styledEl.RiskDescription>}
      </styledEl.RiskCopy>
    </styledEl.RiskRow>
  )
}
