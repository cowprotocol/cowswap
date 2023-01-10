import React from 'react'
import * as styledEl from './styled'
import { ButtonPrimary } from 'components/Button'
import SVG from 'react-inlinesvg'
import iconCompleted from 'assets/cow-swap/check.svg'
import iconProgress from 'assets/cow-swap/loading.svg'
import { ExternalLink } from 'theme'

const BULLET_LIST_CONTENT = [
  { id: 1, content: 'Set any limit price and time horizon' },
  { id: 2, content: 'FREE order placement and cancellation' },
  { id: 3, content: 'Place multiple orders using the same balance' },
  { id: 4, content: 'Always receive 100% of your order surplus' },
  { id: 5, content: 'Protection from MEV by default' },
  { id: 6, iconType: 'progress', content: 'Orders are fill or kill. Partial fills coming soon!' },
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
          {BULLET_LIST_CONTENT.map(({ id, iconType, content }) => (
            <li key={id} data-icon={iconType || null}>
              <span>
                <SVG src={iconType && iconType === 'progress' ? iconProgress : iconCompleted} />
              </span>{' '}
              {content}
            </li>
          ))}
        </styledEl.List>
      )}

      <styledEl.ControlSection>
        <ExternalLink href="https://cow-protocol.medium.com/the-cow-has-no-limits-342e7eae8794">
          Learn more about limit orders ↗
        </ExternalLink>
        <ButtonPrimary onClick={handleUnlock}>Unlock limit orders (BETA)</ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
