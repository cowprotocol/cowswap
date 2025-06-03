import { ReactNode } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import { Wrapper, Summary, SummaryClickable, Details } from './styled'

interface TradeDetailsAccordionProps {
  rateInfo: ReactNode
  feeTotalAmount: CurrencyAmount<Currency> | null
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  children?: ReactNode
  open: boolean
  onToggle: () => void
  feeWrapper?: (feeElement: ReactNode, isOpen: boolean) => ReactNode
}

/**
 * A reusable accordion component for displaying trade details.
 *
 * This component displays rate information, fee amounts, and can expand to show
 * more detailed information about a trade.
 */
export const TradeDetailsAccordion = ({
  rateInfo,
  feeTotalAmount,
  feeUsdTotalAmount,
  children,
  open,
  onToggle,
  feeWrapper,
}: TradeDetailsAccordionProps) => {
  const handleToggle = () => {
    onToggle?.()
  }

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      handleToggle()
    }
  }

  const defaultFeeContent = feeUsdTotalAmount?.greaterThan(0) ? (
    <FiatAmount amount={feeUsdTotalAmount} />
  ) : (
    <>
      {feeTotalAmount?.greaterThan(0) ? (
        <>
          Fee <TokenAmount amount={feeTotalAmount} tokenSymbol={feeTotalAmount?.currency} />
        </>
      ) : (
        'Free'
      )}
    </>
  )

  return (
    <Wrapper isOpen={open}>
      <Summary>
        {rateInfo}
        <SummaryClickable
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={open}
          tabIndex={0}
          isOpen={open}
        >
          {feeWrapper ? feeWrapper(defaultFeeContent, open) : defaultFeeContent}

          <ToggleArrow isOpen={open} />
        </SummaryClickable>
      </Summary>
      <Details isVisible={open}>{children}</Details>
    </Wrapper>
  )
}
