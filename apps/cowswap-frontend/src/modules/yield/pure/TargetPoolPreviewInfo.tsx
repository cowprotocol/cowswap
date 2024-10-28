import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExternalLink, InfoTooltip, TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`

const LeftPart = styled.div`
  display: inline-flex;
  flex-direction: row;
  gap: 10px;
`

const InfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  outline: 0;
  border-radius: 16px;
  background: transparent;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border: 1px solid var(${UI.COLOR_BORDER});
`

const StyledExternalLink = styled(ExternalLink)`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

interface TargetPoolPreviewInfoProps {
  children: ReactNode
  sellToken: TokenWithLogo | Currency
}

export function TargetPoolPreviewInfo({ sellToken, children }: TargetPoolPreviewInfoProps) {
  return (
    <Wrapper>
      <LeftPart>
        {children}
        <InfoButton>
          Details{' '}
          <InfoTooltip>
            When you swap (sell) <TokenSymbol token={sellToken} />, solvers handle the transaction by purchasing the
            required tokens, depositing them into the pool, and issuing LP tokens to you in return—all in a gas-less
            operation.
          </InfoTooltip>
        </InfoButton>
      </LeftPart>
      <StyledExternalLink href="TODO">Analytics ↗</StyledExternalLink>
    </Wrapper>
  )
}
