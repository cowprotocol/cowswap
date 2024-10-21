import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { TokenLogo, useTokensByAddressMap } from '@cowprotocol/tokens'
import { ExternalLink, TokenSymbol } from '@cowprotocol/ui'

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

import { ModalHeader } from '../../pure/ModalHeader'

interface LpTokenPageProps {
  poolAddress: string
  onBack(): void
  onDismiss(): void
  onSelectToken(token: TokenWithLogo): void
}

export function LpTokenPage({ poolAddress, onBack, onDismiss, onSelectToken }: LpTokenPageProps) {
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
              Select
            </SelectButton>
          </div>
        </TokenWrapper>
      )}
      <InfoTable>
        <InfoRow>
          <div>Symbol</div>
          <div>
            <TokenSymbol token={token} />
          </div>
        </InfoRow>
        <InfoRow>
          <div>Fee tier</div>
          <div>
            <span>{info?.feeTier ? `${info.feeTier}%` : '-'}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>Volume (24h)</div>
          <div>
            <span>${info?.volume24h}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>APY</div>
          <div>
            <span>{info?.apy ? `${info.apy}%` : '-'}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>TVL</div>
          <div>
            <span>${info?.tvl}</span>
          </div>
        </InfoRow>
        <InfoRow>
          <div>Pool address</div>
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
