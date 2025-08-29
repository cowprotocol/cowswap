import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import { Command } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { Description } from '../../sharedStyled'

interface ExpiredStepProps {
  children: React.ReactNode
  navigateToNewOrder?: Command
}

const INFO_ICON_HEIGHT = 38

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExpiredStep({ children, navigateToNewOrder }: ExpiredStepProps) {
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleAnalytics = (action: string) => {
    toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.PROGRESS_BAR,
      action,
      label: 'Expired Step',
    })
  }

  return (
    <styledEl.ProgressContainer>
      {children}
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'expired'} flexFlow="column" margin={'14px auto 24px'}>
          <Trans>Your order expired</Trans>
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.CardWrapper>
        <styledEl.InfoCard variant="warning">
          <SVG src={PROGRESS_BAR_BAD_NEWS} height={INFO_ICON_HEIGHT} />
          <h3>
            <Trans>The bad news</Trans>
          </h3>
          <p>
            <Trans>
              Your order expired. This could be due to gas spikes, volatile prices, or problems with the network.
            </Trans>
          </p>
        </styledEl.InfoCard>
        <styledEl.InfoCard variant="success">
          <SVG src={PROGRESS_BAR_GOOD_NEWS} height={INFO_ICON_HEIGHT} />
          <h3>
            <Trans>The good news</Trans>
          </h3>
          <p>
            <Trans>Unlike on other exchanges, you won't be charged for this! Feel free to</Trans>{' '}
            <styledEl.Button
              data-click-event={handleAnalytics('Click Place New Order')}
              onClick={navigateToNewOrder}
              disabled={!navigateToNewOrder}
            >
              <Trans>place a new order</Trans>
            </styledEl.Button>{' '}
            <Trans>without worry.</Trans>
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <Description center margin="10px 0">
        <Trans>If your orders often expire, consider increasing your slippage or contact us on</Trans>{' '}
        <styledEl.Link
          href="https://discord.com/invite/cowprotocol"
          target="_blank"
          data-click-event={handleAnalytics('Click Discord Link')}
        >
          Discord
        </styledEl.Link>{' '}
        <Trans>or send us an email at</Trans>{' '}
        <styledEl.Link href="mailto:help@cow.fi" target="_blank" data-click-event={handleAnalytics('Click Email Link')}>
          help@cow.fi
        </styledEl.Link>{' '}
        <Trans>so we can investigate the problem.</Trans>
      </Description>
    </styledEl.ProgressContainer>
  )
}
