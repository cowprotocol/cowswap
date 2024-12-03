import { TokenWithLogo } from '@cowprotocol/common-const'
import { LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenInfo } from '../TokenInfo'
import { TokenTags } from '../TokenTags'

const LoadingElement = (
  <LoadingRows>
    <LoadingRowSmall />
  </LoadingRows>
)

export interface TokenListItemProps {
  token: TokenWithLogo
  selectedToken?: string
  balance: BigNumber | undefined
  onSelectToken(token: TokenWithLogo): void
  isUnsupported: boolean
  isPermitCompatible: boolean
  isWalletConnected: boolean
}

export function TokenListItem(props: TokenListItemProps) {
  const { token, selectedToken, balance, onSelectToken, isUnsupported, isPermitCompatible, isWalletConnected } = props

  const isTokenSelected = token.address.toLowerCase() === selectedToken?.toLowerCase()

  const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  return (
    <styledEl.TokenItem
      data-address={token.address.toLowerCase()}
      disabled={isTokenSelected}
      onClick={() => onSelectToken(token)}
    >
      <TokenInfo token={token} />
      {isWalletConnected && (
        <>
          <styledEl.TokenBalance>
            {balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}
          </styledEl.TokenBalance>
          <TokenTags isUnsupported={isUnsupported} isPermitCompatible={isPermitCompatible} />
        </>
      )}
    </styledEl.TokenItem>
  )
}
