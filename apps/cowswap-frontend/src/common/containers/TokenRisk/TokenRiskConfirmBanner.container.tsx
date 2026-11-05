import { ReactNode } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { useTokenWarnings } from '@cowprotocol/tokens'
import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { useTokenRiskCopy } from 'common/pure/TokenRisk'

const RiskList = styled.ul`
  margin: 0;
  padding-left: 18px;

  > li + li {
    margin-top: 4px;
  }
`

export interface TokenRiskConfirmBannerProps {
  currency: Nullish<Currency>
}

/**
 * Restates a token's serious risks by name directly above Confirm — the one place the flow names
 * them again after import.
 */
export function TokenRiskConfirmBanner({ currency }: TokenRiskConfirmBannerProps): ReactNode {
  const { seriousWarnings } = useTokenWarnings(currency)
  const symbol = currency?.symbol ?? (currency && !getIsNativeToken(currency) ? currency.address : '')
  const getCopy = useTokenRiskCopy(symbol)

  if (!seriousWarnings.length) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Danger} orientation={BannerOrientation.Horizontal}>
      <RiskList>
        {seriousWarnings.map((warning) => (
          <li key={warning.code}>{getCopy(warning).title}</li>
        ))}
      </RiskList>
    </InlineBanner>
  )
}
