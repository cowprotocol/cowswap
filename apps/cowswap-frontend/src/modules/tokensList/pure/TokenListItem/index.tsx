import { MouseEventHandler } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenListTags } from '@cowprotocol/tokens'
import { LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

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
  selectedToken?: Nullish<Currency>
  balance: BigNumber | undefined

  onSelectToken(token: TokenWithLogo): void

  isUnsupported: boolean
  isPermitCompatible: boolean
  isWalletConnected: boolean
  tokenListTags: TokenListTags
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TokenListItem(props: TokenListItemProps) {
  const {
    token,
    selectedToken,
    balance,
    onSelectToken,
    isUnsupported,
    isPermitCompatible,
    isWalletConnected,
    tokenListTags,
  } = props

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (isTokenSelected) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      onSelectToken(token)
    }
  }

  const isTokenSelected =
    selectedToken &&
    token.address.toLowerCase() === getCurrencyAddress(selectedToken).toLowerCase() &&
    token.chainId === selectedToken.chainId

  const isSupportedChain = token.chainId in SupportedChainId

  const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  return (
    <styledEl.TokenItem
      data-address={token.address.toLowerCase()}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={handleClick}
      className={isTokenSelected ? 'token-item-selected' : ''}
    >
      <TokenInfo
        token={token}
        tags={
          <TokenTags
            isUnsupported={isUnsupported}
            isPermitCompatible={isPermitCompatible}
            tags={token.tags}
            tokenListTags={tokenListTags}
          />
        }
      />
      {isWalletConnected && (
        <styledEl.TokenBalance>
          {isSupportedChain ? balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement : null}
        </styledEl.TokenBalance>
      )}
    </styledEl.TokenItem>
  )
}
