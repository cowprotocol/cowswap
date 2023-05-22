import React from 'react'
import * as styledEl from './styled'
import { ButtonPrimary } from 'legacy/components/Button'
import SVG from 'react-inlinesvg'
import iconCompleted from 'legacy/assets/cow-swap/check.svg'
import { ExternalLink } from 'legacy/theme'

const BULLET_LIST_CONTENT = [
  { id: 1, content: 'Set any limit price and time horizon' },
  { id: 2, content: 'FREE order placement and cancellation' },
  { id: 3, content: 'Place multiple orders using the same balance' },
  { id: 4, content: 'Always receive 100% of your order surplus' },
  { id: 5, content: 'Protection from MEV by default' },
  {
    id: 6,
    content: (
      <span>
        NOW with&nbsp;<b>partial fills</b>&nbsp;support!
      </span>
    ),
    isNew: true,
  },
]

export function UnlockLimitOrders({ handleUnlock }: { handleUnlock: () => void }) {
  return (
    <styledEl.Container>
      <styledEl.TitleSection>
        <h3>Want to try out limit orders?</h3>
        <span>Unlock the BETA version!</span>
      </styledEl.TitleSection>

      {BULLET_LIST_CONTENT && (
        <styledEl.List>
          {BULLET_LIST_CONTENT.map(({ id, isNew, content }) => (
            <li key={id} data-is-new={isNew || null}>
              <span>
                <SVG src={iconCompleted} />
              </span>{' '}
              {content}
            </li>
          ))}
        </styledEl.List>
      )}

      <styledEl.ControlSection>
        <span>
          Learn more about{' '}
          <ExternalLink href="https://medium.com/@cow-protocol/cow-swap-improves-the-limit-order-experience-with-partially-fillable-limit-orders-45f19143e87d">
            partially fillable orders ↗
          </ExternalLink>
        </span>
        <ButtonPrimary id="unlock-limit-orders-btn" onClick={handleUnlock}>
          Unlock limit orders (BETA)
        </ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
