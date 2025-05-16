import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { Wrapper, Summary, SummaryClickable, ToggleIcon, Details } from './styled'

interface TradeDetailsAccordionProps {
  rateInfo: ReactNode
  feeTotalAmount: CurrencyAmount<Currency> | null
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  open: boolean
  onToggle: () => void
  feeWrapper?: (feeElement: ReactNode) => ReactNode
  children?: ReactNode
}

/**
 * A reusable accordion component for displaying trade details.
 *
 * This component displays rate information, fee amounts, and can expand to show
 * more detailed information about a trade.
 *
 * Optionally displays bridge-related summary info if corresponding props are provided.
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
          {feeUsdTotalAmount?.greaterThan(0) ? (
            feeWrapper ? (
              feeWrapper(<FiatAmount amount={feeUsdTotalAmount} />)
            ) : (
              <FiatAmount amount={feeUsdTotalAmount} />
            )
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
          )}

          <ToggleIcon isOpen={open}>
            <SVG src={CarretIcon} title={open ? 'Close' : 'Open'} />
          </ToggleIcon>
        </SummaryClickable>
      </Summary>
      <Details isVisible={open}>{children}</Details>
    </Wrapper>
  )
}
