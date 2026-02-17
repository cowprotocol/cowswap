import { ReactElement, ReactNode } from 'react'

import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { CardTitle, ColumnThreeCard, InlineNote, PayoutValue, TitleWithTooltip } from './shared'

const USDC_LOGO_URL = 'https://files.cow.fi/token-lists/images/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'

type NextPayoutCardProps = {
  payout: ReactNode
  showLoader?: boolean
}

export function NextPayoutCard({ payout, showLoader }: NextPayoutCardProps): ReactElement {
  return (
    <ColumnThreeCard showLoader={showLoader}>
      <CardTitle>
        <TitleWithTooltip>
          <span>
            <Trans>Next payout</Trans>
          </span>
          <HelpTooltip
            text={t`The amount you should expect to receive at the next payout, if no further volume is generated.`}
          />
        </TitleWithTooltip>
      </CardTitle>
      <PayoutValue>
        <img src={USDC_LOGO_URL} height={36} width={36} alt="" role="presentation" />
        {payout}
      </PayoutValue>
      <InlineNote>
        <Trans>Paid weekly via airdrop.</Trans>
      </InlineNote>
    </ColumnThreeCard>
  )
}
