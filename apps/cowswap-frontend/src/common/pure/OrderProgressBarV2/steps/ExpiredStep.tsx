import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import { Command } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from '../styled'

interface ExpiredStepProps {
  children: React.ReactNode
  navigateToNewOrder?: Command
}

function ExpiredStep({ children, navigateToNewOrder }: ExpiredStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'expired'} flexFlow="column" margin={'14px auto 24px'}>
          Your order expired
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.CardWrapper>
        <styledEl.InfoCard variant="warning">
          <SVG src={PROGRESS_BAR_BAD_NEWS} height={38} />
          <h3>The bad news</h3>
          <p>Your order expired. This could be due to gas spikes, volatile prices, or problems with the network.</p>
        </styledEl.InfoCard>
        <styledEl.InfoCard variant="success">
          <SVG src={PROGRESS_BAR_GOOD_NEWS} height={38} />
          <h3>The good news</h3>
          <p>
            Unlike on other exchanges, you won't be charged for this! Feel free to{' '}
            <styledEl.Button
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                action: 'Click Place New Order',
                label: 'Expired Step',
              })}
              onClick={navigateToNewOrder}
            >
              place a new order
            </styledEl.Button>{' '}
            without worry.
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <styledEl.Description center margin="10px 0">
        If your orders often expire, consider increasing your slippage or contact us on{' '}
        <styledEl.Link
          href="https://discord.com/invite/cowprotocol"
          target="_blank"
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.PROGRESS_BAR,
            action: 'Click Discord Link',
            label: 'Expired Step',
          })}
        >
          Discord
        </styledEl.Link>{' '}
        or send us an email at{' '}
        <styledEl.Link
          href="mailto:help@cow.fi"
          target="_blank"
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.PROGRESS_BAR,
            action: 'Click Email Link',
            label: 'Expired Step',
          })}
        >
          help@cow.fi
        </styledEl.Link>{' '}
        so we can investigate the problem.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

export default ExpiredStep
