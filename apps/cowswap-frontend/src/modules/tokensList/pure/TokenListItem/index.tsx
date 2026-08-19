import { MouseEventHandler, ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, getTokenId, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenListTags } from '@cowprotocol/tokens'
import { FiatAmount, HoverTooltip, LoadingRows, LoadingRowSmall, TokenAmount } from '@cowprotocol/ui'

import { Nullish } from 'types'

import { CrossChainBalanceRow } from './CrossChainBalanceRow'
import * as styledEl from './styled'

import { CrossChainBalanceInfo } from '../../hooks/useCrossChainBalances'
import { useDeferredVisibility } from '../../hooks/useDeferredVisibility'
import { TokenSelectionHandler } from '../../types'
import { checkIsTokenSelected } from '../../utils/checkIsTokenSelected'
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
  balance: bigint | undefined
  usdAmount?: CurrencyAmount<Currency> | null
  crossChainBalances?: CrossChainBalanceInfo | null

  onSelectToken?: TokenSelectionHandler
  onSelectNetworkToken?(chainId: SupportedChainId, token: TokenWithLogo): void

  isWalletConnected: boolean
  isUnsupported?: boolean
  isPermitCompatible?: boolean
  tokenListTags?: TokenListTags
  children?: ReactNode
  className?: string
  disabled?: boolean
  disabledReason?: string
}

interface DisabledProps {
  'aria-disabled'?: true
  tabIndex?: -1
}

interface DisabledTooltipProps {
  children: ReactNode
  disabled: boolean
  disabledReason?: string
}

function DisabledTooltip({ children, disabled, disabledReason }: DisabledTooltipProps): ReactNode {
  if (!disabled || !disabledReason) return children
  return (
    <HoverTooltip wrapInContainer placement="top" content={disabledReason}>
      {children}
    </HoverTooltip>
  )
}

function getClassName(isTokenSelected: boolean, disabled: boolean, className = ''): string {
  const selectedClass = isTokenSelected ? 'token-item-selected' : ''
  const disabledClass = disabled ? 'token-item-disabled' : ''
  return `${className} ${selectedClass} ${disabledClass}`.trim()
}

function getDisabledProps(disabled: boolean): DisabledProps {
  if (!disabled) return {}
  return { 'aria-disabled': true, tabIndex: -1 }
}

const EMPTY_TAGS = {}

interface TokenBalanceColumnProps {
  shouldShow: boolean
  shouldFormat: boolean
  balanceAmount?: CurrencyAmount<Currency>
  usdAmount?: CurrencyAmount<Currency> | null
  crossChainBalances?: CrossChainBalanceInfo | null
}

export function TokenListItem(props: TokenListItemProps): ReactNode {
  const {
    token,
    selectedToken,
    balance,
    usdAmount,
    crossChainBalances,
    onSelectToken,
    onSelectNetworkToken,
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
  const shouldShowBalances = isWalletConnected
  const shouldFormatBalances = shouldShowBalances && hasIntersected
  const balanceAmount =
    shouldFormatBalances && balance !== undefined ? CurrencyAmount.fromRawAmount(token, balance.toString()) : undefined

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (isTokenSelected || disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onSelectToken?.(token)
  }

  const crossChain =
    shouldFormatBalances && crossChainBalances && crossChainBalances.perNetwork.length > 0 ? crossChainBalances : null

  return (
    <DisabledTooltip disabled={disabled} disabledReason={disabledReason}>
      <styledEl.TokenItem
        ref={visibilityRef}
        data-address={getAddressKey(token.address)}
        data-token-symbol={token.symbol || ''}
        data-token-name={token.name || ''}
        data-element-type="token-selection"
        onClick={handleClick}
        className={getClassName(isTokenSelected, disabled, className)}
        {...getDisabledProps(disabled)}
      >
        <styledEl.TopRow>
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
            crossChainBalances={crossChainBalances}
          />
          {children}
        </styledEl.TopRow>
        {crossChain && onSelectNetworkToken ? (
          <CrossChainBalanceRow
            perNetwork={crossChain.perNetwork}
            selectedToken={selectedToken}
            onSelectNetworkToken={onSelectNetworkToken}
          />
        ) : null}
      </styledEl.TokenItem>
    </DisabledTooltip>
  )
}

function TokenBalanceColumn({
  shouldShow,
  shouldFormat,
  balanceAmount,
  usdAmount,
  crossChainBalances,
}: TokenBalanceColumnProps): ReactNode {
  if (!shouldShow) {
    return null
  }

  const crossChain = crossChainBalances && crossChainBalances.perNetwork.length > 0 ? crossChainBalances : null
  const displayAmount = crossChain ? crossChain.totalAmount : balanceAmount

  return (
    <styledEl.TokenBalance>
      {shouldFormat ? (
        <>
          {displayAmount ? <TokenAmount amount={displayAmount} /> : LoadingElement}
          {usdAmount ? <FiatAmount amount={usdAmount} /> : null}
        </>
      ) : (
        LoadingElement
      )}
    </styledEl.TokenBalance>
  )
}
