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
  feeWrapper?: (feeElement: ReactNode) => ReactNode
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: TradeDetailsAccordionProps) => {
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleToggle = () => {
    onToggle?.()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
          {feeWrapper ? feeWrapper(defaultFeeContent) : defaultFeeContent}

          <ToggleArrow isOpen={open} />
        </SummaryClickable>
      </Summary>
      <Details isVisible={open}>{children}</Details>
    </Wrapper>
  )
}
