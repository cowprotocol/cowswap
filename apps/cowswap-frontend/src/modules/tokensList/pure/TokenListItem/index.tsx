import { MouseEventHandler, ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenListTags } from '@cowprotocol/tokens'
import { FiatAmount, LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'
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
  usdAmount?: CurrencyAmount<Currency> | null

  onSelectToken?(token: TokenWithLogo): void

  isWalletConnected: boolean
  isUnsupported?: boolean
  isPermitCompatible?: boolean
  tokenListTags?: TokenListTags
  children?: ReactNode
  className?: string
}

function getClassName(isTokenSelected: boolean, className = ''): string {
  return `${className} ${isTokenSelected ? 'token-item-selected' : ''}`
}

const EMPTY_TAGS = {}

export function TokenListItem(props: TokenListItemProps): ReactNode {
  const {
    token,
    selectedToken,
    balance,
    usdAmount,
    onSelectToken,
    isUnsupported = false,
    isPermitCompatible = false,
    isWalletConnected,
    tokenListTags = EMPTY_TAGS,
    children,
    className,
  } = props

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (isTokenSelected) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      onSelectToken?.(token)
    }
  }

  const isTokenSelected = Boolean(
    selectedToken &&
      token.address.toLowerCase() === getCurrencyAddress(selectedToken).toLowerCase() &&
      token.chainId === selectedToken.chainId,
  )

  const isSupportedChain = token.chainId in SupportedChainId

  const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  return (
    <styledEl.TokenItem
      data-address={token.address.toLowerCase()}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={handleClick}
      className={getClassName(isTokenSelected, className)}
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
          {isSupportedChain ? (
            <>
              {balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}
              {usdAmount ? <FiatAmount amount={usdAmount} /> : null}
            </>
          ) : null}
        </styledEl.TokenBalance>
      )}
      {children}
    </styledEl.TokenItem>
  )
}
