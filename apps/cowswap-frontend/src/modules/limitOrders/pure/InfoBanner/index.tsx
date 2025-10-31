import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import { ClosableBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { Link as ReactRouterLink } from 'react-router'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

const LOCAL_STORAGE_KEY = 'limitOrders_showInfoBanner'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InfoBanner() {
  return (
    <>
      {ClosableBanner(LOCAL_STORAGE_KEY, (close) => {
        return (
          <styledEl.InfoPopup>
            <div className="icon">
              <SVG src={AlertIcon} />
            </div>
            <div className="content">
              <Trans>Your order may not fill exactly when the market price reaches your limit price.</Trans>{' '}
              <ReactRouterLink
                target="_blank"
                to="https://docs.cow.fi/cow-protocol/tutorials/cow-swap/limit#track-a-limit-order"
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.TRADE,
                  action: 'Click limit order fees FAQ link',
                })}
              >
                <Trans>Learn more</Trans>
              </ReactRouterLink>
            </div>

            <styledEl.CloseIcon
              onClick={close}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.TRADE,
                action: 'Close limit order info banner',
              })}
            />
          </styledEl.InfoPopup>
        )
      })}
    </>
  )
}
