import { useMemo } from 'react'

import { TokenLogo, useSearchToken } from '@cowprotocol/tokens'
import { Loader, TokenSymbol } from '@cowprotocol/ui'

import { NfaItem } from '../../pure/NfaItem'

interface MostTradingTokenProps {
  tokenAddress: string
  percent: number
  type: string
}

export function MostTradingToken(props: MostTradingTokenProps) {
  const { tokenAddress, percent, type } = props
  const { isLoading, blockchainResult, externalApiResult, activeListsResult, inactiveListsResult } =
    useSearchToken(tokenAddress)
  const token = useMemo(() => {
    return blockchainResult[0] || externalApiResult[0] || activeListsResult[0] || inactiveListsResult[0]
  }, [blockchainResult, externalApiResult, activeListsResult, inactiveListsResult])

  if (isLoading)
    return (
      <NfaItem>
        <Loader /> Loading
      </NfaItem>
    )

  return (
    <NfaItem>
      <TokenLogo token={token} />
      <div>
        🔥 Trending Now:{' '}
        <strong>
          <TokenSymbol token={token} />
        </strong>{' '}
        is the most {type} token in the last hour! Trading volume share: {percent}%
      </div>
    </NfaItem>
  )
}
