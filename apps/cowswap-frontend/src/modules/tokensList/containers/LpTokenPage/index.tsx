import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { TokenLogo, useTokensByAddressMap } from '@cowprotocol/tokens'
import { ExternalLink, ModalHeader, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { usePoolsInfo } from 'modules/yield/shared'

import {
  InfoRow,
  InfoTable,
  SelectButton,
  StyledTokenName,
  StyledTokenSymbol,
  TokenInfoWrapper,
  TokenWrapper,
  Wrapper,
} from './styled'

function renderValue<T>(value: T | undefined, template: (v: T) => string, defaultValue?: string): string | undefined {
  return value ? template(value) : defaultValue
}

interface LpTokenPageProps {
  poolAddress: string

  onBack(): void

  onDismiss(): void

  onSelectToken(token: TokenWithLogo): void
}

// eslint-disable-next-line max-lines-per-function
export function LpTokenPage({ poolAddress, onBack, onDismiss, onSelectToken }: LpTokenPageProps): ReactNode {
  const poolsInfo = usePoolsInfo()
  const tokensByAddress = useTokensByAddressMap()

  const token = tokensByAddress[poolAddress]
  const info = poolsInfo?.[poolAddress]?.info

  return (
    <Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        Pool description
      </ModalHeader>
      {token && (
        <TokenWrapper>
          <TokenInfoWrapper>
            <TokenLogo token={token} size={64} />
            <div>
              <div>
                <StyledTokenSymbol token={token} />
              </div>
              <StyledTokenName token={token} />
            </div>
          </TokenInfoWrapper>
          <div>
            <SelectButton
              onClick={() => {
                onDismiss()
                onSelectToken(token)
              }}
            >
              <Trans>Select</Trans>
            </SelectButton>
          </div>
        </TokenWrapper>
      )}
      <InfoTable>
        <InfoRow>
          <div>
            <Trans>Symbol</Trans>
          </div>
          <div>
            <TokenSymbol token={token} />
          </div>
        </InfoRow>
        <InfoRow>
          <div>
            <Trans>Fee tier</Trans>
          </div>
          <div>
            <span>{renderValue(info?.feeTier, (t) => `${t}%`, '-')}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>
            <Trans>Volume (24h)</Trans>
          </div>
          <div>
            <span>{renderValue(info?.volume24h, (t) => `$${t}`, '-')}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>
            <Trans>APR</Trans>
          </div>
          <div>
            <span>{renderValue(info?.apy, (t) => `${t}%`, '-')}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>
            <Trans>TVL</Trans>
          </div>
          <div>
            <span>{renderValue(info?.tvl, (t) => `$${t}`, '-')}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>
            <Trans>Pool address</Trans>
          </div>
          <div>
            {token && (
              <ExternalLink href={getExplorerLink(token.chainId, token.address, ExplorerDataType.ADDRESS)}>
                {shortenAddress(token.address)} ↗
              </ExternalLink>
            )}
          </div>
        </InfoRow>
      </InfoTable>
    </Wrapper>
  )
}
