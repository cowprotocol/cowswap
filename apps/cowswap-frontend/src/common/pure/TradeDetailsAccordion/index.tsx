import { ReactNode, useCallback } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import { Details, Summary, SummaryClickable, Wrapper } from './styled'

interface TradeDetailsAccordionProps {
  rateInfo: ReactNode
  feeTotalAmount: CurrencyAmount<Currency> | null
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  children?: ReactNode
  open: boolean
  onToggle: () => void
  feeWrapper?: (feeElement: ReactNode, isOpen: boolean) => ReactNode
}

function DefaultFeeContent({
  feeUsdTotalAmount,
  feeTotalAmount,
}: {
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  feeTotalAmount: CurrencyAmount<Currency> | null
}): ReactNode {
  if (feeUsdTotalAmount?.greaterThan(0)) {
    return <FiatAmount amount={feeUsdTotalAmount} />
  }

  if (feeTotalAmount?.greaterThan(0)) {
    return (
      <>
        <Trans>Fee</Trans> <TokenAmount amount={feeTotalAmount} tokenSymbol={feeTotalAmount?.currency} />
      </>
    )
  }

  return <Trans>Free</Trans>
}

/**
 * A reusable accordion component for displaying trade details.
 *
 * This component displays rate information, fee amounts, and can expand to show
 * more detailed information about a trade.
 */
export function TradeDetailsAccordion({
  rateInfo,
  feeTotalAmount,
  feeUsdTotalAmount,
  children,
  open,
  onToggle,
  feeWrapper,
}: TradeDetailsAccordionProps): ReactNode {
  const handleKeyDown = useCallback(
    (e: { key: string; preventDefault: () => void }): void => {
      if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle],
  )

  const defaultFeeContent = <DefaultFeeContent feeUsdTotalAmount={feeUsdTotalAmount} feeTotalAmount={feeTotalAmount} />

  return (
    <Wrapper isOpen={open}>
      <Summary>
        {rateInfo}
        <SummaryClickable onClick={onToggle} onKeyDown={handleKeyDown} aria-expanded={open} tabIndex={0} isOpen={open}>
          {feeWrapper ? feeWrapper(defaultFeeContent, open) : defaultFeeContent}

          <ToggleArrow isOpen={open} />
        </SummaryClickable>
      </Summary>
      <Details isVisible={open}>{children}</Details>
    </Wrapper>
  )
}
