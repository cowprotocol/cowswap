import { useMemo } from 'react'

import { TokenLogo, useSearchToken } from '@cowprotocol/tokens'
import { Loader, TokenSymbol } from '@cowprotocol/ui'

import { NfaItem } from '../../pure/NfaItem'

interface MostUsingTokenProps {
  tokenAddress: string
  percent: number
  type: string
}

export function MostUsingToken(props: MostUsingTokenProps) {
  const { tokenAddress, percent, type } = props
  const { isLoading, blockchainResult, externalApiResult, activeListsResult, inactiveListsResult } =
    useSearchToken(tokenAddress)
  const token = useMemo(() => {
    return externalApiResult[0] || blockchainResult[0] || activeListsResult[0] || inactiveListsResult[0]
  }, [blockchainResult, externalApiResult, activeListsResult, inactiveListsResult])

  if (isLoading) {
    return (
      <NfaItem>
        <Loader />
      </NfaItem>
    )
  }

  return (
    <NfaItem>
      <TokenLogo token={token} />
      <div>
        💎 Top {type === 'sold' ? 'selling' : 'buying'} Tokens Alert! {percent}% of the users just {type}{' '}
        <strong>
          <TokenSymbol token={token} />
        </strong>{' '}
        !
      </div>
    </NfaItem>
  )
}
