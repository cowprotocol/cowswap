import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import BungeeLogo from '@cowprotocol/assets/images/bungee-logo.svg'
import { FiatAmount, ProductVariant, TokenAmount, UI } from '@cowprotocol/ui'
import { ProductLogo } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { Wrapper, Summary, SummaryClickable, ToggleIcon, Details, ProtocolIcon, ProtocolIconsContainer } from './styled'

// TODO(bridge): Remove this toggle once actual bridge transaction time estimation is implemented
// This is a temporary placeholder for displaying estimated bridge transaction completion time
const SHOW_BRIDGE_TIME_PLACEHOLDER = true

// TODO(bridge): Remove this helper once actual bridge time calculation is implemented
// Generates a random bridge transaction time estimate between 2-15 minutes
const getBridgeEstimatedMinutes = () => Math.floor(Math.random() * (15 - 2 + 1)) + 2

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
          <>
            {feeUsdTotalAmount?.greaterThan(0) ? (
              <>
                <FiatAmount amount={feeUsdTotalAmount} />
                {/* TODO(bridge): Replace with actual bridge transaction time estimation logic */}
                {SHOW_BRIDGE_TIME_PLACEHOLDER && (
                  <>
                    {
                      <span title={`Estimated bridge transaction time: ${getBridgeEstimatedMinutes()} minutes`}>
                        / {getBridgeEstimatedMinutes()} min
                      </span>
                    }
                    <ProtocolIconsContainer>
                      <ProtocolIcon bgColor={UI.COLOR_BLUE_900_PRIMARY} title="Cow Protocol">
                        <ProductLogo
                          variant={ProductVariant.CowProtocol}
                          height={18}
                          logoIconOnly
                          overrideColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
                          overrideHoverColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
                        />
                      </ProtocolIcon>
                      <ProtocolIcon title="Bungee Exchange">
                        <SVG src={BungeeLogo} width={18} height={18} title="Bungee" />
                      </ProtocolIcon>
                    </ProtocolIconsContainer>
                  </>
                )}
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
          <ToggleIcon isOpen={open}>
            <SVG src={CarretIcon} title={open ? 'Close' : 'Open'} />
          </ToggleIcon>
        </SummaryClickable>
      </Summary>
      <Details isVisible={open}>{children}</Details>
    </Wrapper>
  )
}
