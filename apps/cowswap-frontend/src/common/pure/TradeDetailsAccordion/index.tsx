
import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { Wrapper, Summary, SummaryClickable, ToggleIcon, Details } from './styled'

interface TradeDetailsAccordionProps {
  rateInfo: React.ReactNode
  feeTotalAmount: CurrencyAmount<Currency> | null
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  children?: React.ReactNode
  open: boolean
  onToggle: () => void
}

export const TradeDetailsAccordion = ({
  rateInfo,
  feeTotalAmount,
  feeUsdTotalAmount,
  children,
  open,
  onToggle,
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
          {!open && (
            <>
              {feeUsdTotalAmount?.greaterThan(0) ? (
                <>
                  <FiatAmount amount={feeUsdTotalAmount} />
                </>
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
            </>
          )}
          <ToggleIcon isOpen={open}>
            <SVG src={CarretIcon} title={open ? 'Close' : 'Open'} />
          </ToggleIcon>
        </SummaryClickable>
      </Summary>
      {open && <Details>{children}</Details>}
    </Wrapper>
  )
}
