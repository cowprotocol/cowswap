import { ReactNode } from 'react'

import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { TokenImg } from '../../../../components/common/TokenImg'

export function TokenLink({
  symbol,
  tokenAddress,
  chainId,
}: {
  symbol: string
  tokenAddress: string | undefined
  chainId: SupportedChainId | null
}): ReactNode {
  if (!tokenAddress || !chainId) return <TokenLinkContainer>{symbol}</TokenLinkContainer>
  const url = getBlockExplorerUrl(chainId, 'token', tokenAddress)
  return (
    <TokenLinkContainer>
      <TokenIcon address={tokenAddress} network={chainId} symbol={symbol} />
      <a href={url} target="_blank" rel="noopener noreferrer" title={tokenAddress}>
        {symbol}
      </a>
    </TokenLinkContainer>
  )
}

const TokenLinkContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TokenIcon = styled(TokenImg)`
  width: 20px;
  height: 20px;
`
