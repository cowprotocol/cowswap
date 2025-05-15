import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { BridgeAccordionSummary, BridgeProtocolConfig } from 'modules/bridge'

import { Wrapper, Summary, SummaryClickable, ToggleIcon, Details } from './styled'

interface TradeDetailsAccordionProps {
  rateInfo: React.ReactNode
  feeTotalAmount: CurrencyAmount<Currency> | null
  feeUsdTotalAmount: CurrencyAmount<Currency> | null
  children?: React.ReactNode
  open: boolean
  onToggle: () => void

  // Optional bridge-related props
  /** Estimated time for bridge transaction */
  bridgeEstimatedTime?: number
  /** Information about the bridge protocol */
  bridgeProtocol?: BridgeProtocolConfig
  /** Whether to show bridge-related UI elements in the summary */
  showBridgeUI?: boolean
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
  bridgeEstimatedTime,
  bridgeProtocol,
  showBridgeUI = false,
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
            showBridgeUI && bridgeProtocol ? (
              <BridgeAccordionSummary bridgeEstimatedTime={bridgeEstimatedTime} bridgeProtocol={bridgeProtocol}>
                <FiatAmount amount={feeUsdTotalAmount} />
              </BridgeAccordionSummary>
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
