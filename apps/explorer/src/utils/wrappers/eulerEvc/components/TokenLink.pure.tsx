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
  if (!tokenAddress || !chainId) return <>{symbol}</>
  const url = getBlockExplorerUrl(chainId, 'token', tokenAddress)
  return (
    <>
      <TokenIcon address={tokenAddress} network={chainId} symbol={symbol} />
      <a href={url} target="_blank" rel="noopener noreferrer" title={tokenAddress}>
        {symbol}
      </a>
    </>
  )
}

const TokenIcon = styled(TokenImg)`
  width: 2rem;
  height: 2rem;
`
