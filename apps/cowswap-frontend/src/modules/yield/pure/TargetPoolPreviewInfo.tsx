import { ReactNode } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, InfoTooltip, TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { LP_PAGE_LINKS } from '../lpPageLinks'

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
  chainId: SupportedChainId
  children: ReactNode
  sellToken: LpToken | TokenWithLogo | Currency
  oppositeToken?: Currency | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TargetPoolPreviewInfo({ chainId, sellToken, oppositeToken, children }: TargetPoolPreviewInfoProps) {
  if (!(sellToken instanceof LpToken) || !sellToken.lpTokenProvider) return null

  return (
    <Wrapper>
      <LeftPart>
        {children}
        {oppositeToken && (
          <InfoButton>
            Details{' '}
            <InfoTooltip>
              When you swap (sell) <TokenSymbol token={oppositeToken} />, solvers handle the transaction by purchasing
              the required tokens, depositing them into the pool, and issuing LP tokens to you in return — all in a
              gas-less operation.
            </InfoTooltip>
          </InfoButton>
        )}
      </LeftPart>
      <StyledExternalLink href={LP_PAGE_LINKS[sellToken.lpTokenProvider](chainId, sellToken.address)}>
        Analytics ↗
      </StyledExternalLink>
    </Wrapper>
  )
}
