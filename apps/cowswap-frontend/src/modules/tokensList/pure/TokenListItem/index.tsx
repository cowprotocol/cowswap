import { MouseEventHandler, ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, getCurrencyAddress, getTokenId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenListTags } from '@cowprotocol/tokens'
import { FiatAmount, LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import * as styledEl from './styled'

import { useDeferredVisibility } from '../../hooks/useDeferredVisibility'
import { TokenSelectionHandler } from '../../types'
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

  onSelectToken?: TokenSelectionHandler

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

  const tokenKey = getTokenId(token)
  // Defer heavyweight UI (tooltips, formatted numbers) until the row is about to enter the viewport.
  const { ref: visibilityRef, isVisible: hasIntersected } = useDeferredVisibility<HTMLDivElement>({
    resetKey: tokenKey,
    rootMargin: '200px',
  })

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
      areAddressesEqual(token.address, getCurrencyAddress(selectedToken)) &&
      token.chainId === selectedToken.chainId,
  )

  const isSupportedChain = token.chainId in SupportedChainId
  const shouldShowBalances = isWalletConnected && isSupportedChain
  // Formatting balances (BigNumber -> CurrencyAmount -> Fiat) is expensive; delay until the row is visible.
  const shouldFormatBalances = shouldShowBalances && hasIntersected
  const balanceAmount =
    shouldFormatBalances && balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  return (
    <styledEl.TokenItem
      ref={visibilityRef}
      data-address={token.address.toLowerCase()}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={handleClick}
      className={getClassName(isTokenSelected, className)}
    >
      <TokenInfo
        token={token}
        showAddress={hasIntersected}
        tags={
          hasIntersected ? (
            <TokenTags
              isUnsupported={isUnsupported}
              isPermitCompatible={isPermitCompatible}
              tags={token.tags}
              tokenListTags={tokenListTags}
            />
          ) : null
        }
      />
      <TokenBalanceColumn
        shouldShow={shouldShowBalances}
        shouldFormat={shouldFormatBalances}
        balanceAmount={balanceAmount}
        usdAmount={usdAmount}
      />
      {children}
    </styledEl.TokenItem>
  )
}

interface TokenBalanceColumnProps {
  shouldShow: boolean
  shouldFormat: boolean
  balanceAmount?: CurrencyAmount<Currency>
  usdAmount?: CurrencyAmount<Currency> | null
}

function TokenBalanceColumn({
  shouldShow,
  shouldFormat,
  balanceAmount,
  usdAmount,
}: TokenBalanceColumnProps): ReactNode {
  if (!shouldShow) {
    return null
  }

  return (
    <styledEl.TokenBalance>
      {shouldFormat ? (
        <>
          {balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}
          {usdAmount ? <FiatAmount amount={usdAmount} /> : null}
        </>
      ) : (
        LoadingElement
      )}
    </styledEl.TokenBalance>
  )
}
