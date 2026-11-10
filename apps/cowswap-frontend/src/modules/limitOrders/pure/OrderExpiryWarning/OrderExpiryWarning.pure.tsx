import { ReactNode } from 'react'

import { Currency } from '@cowprotocol/currency'
import { InlineBanner, StatusColorVariant, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './OrderExpiryWarning.styled'

import { OrderExpiryWarningTier } from '../../utils/getOrderExpiryWarningTier.utils'
import { WarningAcknowledgement } from '../WarningAcknowledgement/WarningAcknowledgement.pure'

export interface OrderExpiryWarningProps {
  tier: OrderExpiryWarningTier
  inputCurrency: Currency | null | undefined
  isAccepted: boolean
  onAcknowledgeChange(checked: boolean): void
}

export function OrderExpiryWarning({
  tier,
  inputCurrency,
  isAccepted,
  onAcknowledgeChange,
}: OrderExpiryWarningProps): ReactNode {
  if (tier === OrderExpiryWarningTier.None) return null

  const token = <TokenSymbol token={inputCurrency} />

  if (tier === OrderExpiryWarningTier.Subtle) {
    return (
      <div data-testid="order-expiry-warning-subtle">
        <InlineBanner bannerType={StatusColorVariant.Info} iconSize={24}>
          <Trans>
            Until it expires, this order can fill whenever enough {token} is in your wallet, including funds added
            later.
          </Trans>
        </InlineBanner>
      </div>
    )
  }

  return (
    <styledEl.ProminentWrapper data-testid="order-expiry-warning-prominent">
      <InlineBanner
        bannerType={StatusColorVariant.Danger}
        iconSize={32}
        borderRadius="16px 16px 0 0"
        margin="0"
        width="100%"
      >
        <strong>
          <Trans>This order stays active for more than a week</Trans>
        </strong>
        <p>
          <Trans>
            Running out of {token} doesn't cancel this order. If {token} returns to your wallet before it expires, the
            order can fill, possibly at a price you no longer want.
          </Trans>
        </p>
      </InlineBanner>
      <WarningAcknowledgement
        isAccepted={isAccepted}
        onAcknowledgeChange={onAcknowledgeChange}
        checkboxTestId="order-expiry-warning-checkbox"
      >
        <Trans>I understand this order can fill whenever funds return to my wallet</Trans>
      </WarningAcknowledgement>
    </styledEl.ProminentWrapper>
  )
}
