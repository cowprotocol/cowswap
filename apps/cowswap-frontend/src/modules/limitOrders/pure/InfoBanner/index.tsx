import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import { ClosableBanner } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { HashLink } from 'react-router-hash-link'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

const LOCAL_STORAGE_KEY = 'limitOrders_showInfoBanner'

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
              Your order may not fill exactly when the market price reaches your limit price.{' '}
              <HashLink
                target="_blank"
                to="/faq/limit-order#how-do-fees-work"
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.TRADE,
                  action: 'Click limit order fees FAQ link',
                })}
              >
                Learn more
              </HashLink>
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
