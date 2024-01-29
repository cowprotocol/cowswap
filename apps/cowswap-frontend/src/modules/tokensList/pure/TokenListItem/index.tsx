import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenInfo } from '../TokenInfo'
import { TokenTags } from '../TokenTags'

import type { VirtualItem } from '@tanstack/react-virtual'

export interface TokenListItemProps {
  token: TokenWithLogo
  selectedToken?: string
  balance: BigNumber | undefined
  onSelectToken(token: TokenWithLogo): void
  measureElement?: (node: Element | null) => void
  virtualRow?: VirtualItem
  isUnsupported: boolean
  isPermitCompatible: boolean
}

export function TokenListItem(props: TokenListItemProps) {
  const {
    token,
    selectedToken,
    balance,
    onSelectToken,
    virtualRow,
    isUnsupported,
    isPermitCompatible,
    measureElement,
  } = props

  const isTokenSelected = token.address.toLowerCase() === selectedToken?.toLowerCase()

  const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  return (
    <styledEl.TokenItem
      key={token.address}
      data-index={virtualRow?.index}
      ref={measureElement}
      data-address={token.address.toLowerCase()}
      disabled={isTokenSelected}
      onClick={() => onSelectToken(token)}
    >
      <TokenInfo token={token} />
      <styledEl.TokenBalance>{balanceAmount && <TokenAmount amount={balanceAmount} />}</styledEl.TokenBalance>
      <TokenTags isUnsupported={isUnsupported} isPermitCompatible={isPermitCompatible} />
    </styledEl.TokenItem>
  )
}
