import { MouseEventHandler, ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, getCurrencyAddress, getTokenId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenListTags } from '@cowprotocol/tokens'
import { FiatAmount, HoverTooltip, LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'
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
  disabled?: boolean
  disabledReason?: string
}

function getClassName(isTokenSelected: boolean, disabled: boolean, className = ''): string {
  const selectedClass = isTokenSelected ? 'token-item-selected' : ''
  const disabledClass = disabled ? 'token-item-disabled' : ''
  return `${className} ${selectedClass} ${disabledClass}`.trim()
}

interface DisabledProps {
  'aria-disabled'?: true
  tabIndex?: -1
}

function getDisabledProps(disabled: boolean): DisabledProps {
  if (!disabled) return {}
  return { 'aria-disabled': true, tabIndex: -1 }
}

function checkIsTokenSelected(token: TokenWithLogo, selectedToken: Nullish<Currency>): boolean {
  if (!selectedToken) return false
  return areAddressesEqual(token.address, getCurrencyAddress(selectedToken)) && token.chainId === selectedToken.chainId
}

function wrapWithTooltip(content: ReactNode, disabled: boolean, disabledReason?: string): ReactNode {
  if (!disabled || !disabledReason) return content
  return (
    <HoverTooltip wrapInContainer placement="top" content={disabledReason}>
      {content}
    </HoverTooltip>
  )
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
    disabled = false,
    disabledReason,
  } = props

  const { ref: visibilityRef, isVisible: hasIntersected } = useDeferredVisibility<HTMLDivElement>({
    resetKey: getTokenId(token),
    rootMargin: '200px',
  })

  const isTokenSelected = checkIsTokenSelected(token, selectedToken)
  const isSupportedChain = token.chainId in SupportedChainId
  const shouldShowBalances = isWalletConnected && isSupportedChain
  const shouldFormatBalances = shouldShowBalances && hasIntersected
  const balanceAmount =
    shouldFormatBalances && balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (isTokenSelected || disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onSelectToken?.(token)
  }

  return wrapWithTooltip(
    <styledEl.TokenItem
      ref={visibilityRef}
      data-address={token.address.toLowerCase()}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={handleClick}
      className={getClassName(isTokenSelected, disabled, className)}
      {...getDisabledProps(disabled)}
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
    </styledEl.TokenItem>,
    disabled,
    disabledReason,
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
