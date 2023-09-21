import React from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { LightCard as LightCardUni } from 'legacy/components/Card'
import { SwapShowAcceptChanges } from 'legacy/components/swap/styleds'
import { HighFeeWarning as HighFeeWarningBase } from 'legacy/components/SwapWarnings'

import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { UI } from 'common/constants/theme'

import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'

const LightCard = styled(LightCardUni)<{ flatBorder?: boolean }>`
  background-color: var(${UI.COLOR_GREY});
  border: none;
  ${({ flatBorder = false }) => flatBorder && `border-radius: 20px 20px 0 0;`};
`

export type LightCardType = typeof LightCard

// targettable by styled injection
const HighFeeWarning = styled(HighFeeWarningBase)``

const Wrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
  `};

  ${SwapShowAcceptChanges} {
    background: ${({ theme }) => transparentize(0.85, theme.alert)};
    border: 1px solid ${({ theme }) => transparentize(0.75, theme.alert)};
    padding: 8px 8px 8px 16px;
    margin: 8px 0 0;

    svg {
      stroke: ${({ theme }) => theme.alert};
    }
  }

  svg {
    stroke: var(${UI.COLOR_TEXT1});
  }
`

export default function SwapModalHeader(
  props: Omit<SwapModalHeaderProps, 'HighFeeWarning' | 'NoImpactWarning' | 'LightCard'>
) {
  const { allowsOffchainSigning } = useWalletDetails()
  const NoImpactWarningComponent = <NoImpactWarning isAccepted={true} withoutAccepting={true} />

  return (
    <Wrapper>
      <SwapModalHeaderMod
        {...props}
        allowsOffchainSigning={allowsOffchainSigning}
        LightCard={LightCard}
        HighFeeWarning={HighFeeWarning}
        NoImpactWarning={NoImpactWarningComponent}
      />
    </Wrapper>
  )
}
