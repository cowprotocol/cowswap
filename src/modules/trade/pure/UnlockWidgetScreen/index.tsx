import SVG from 'react-inlinesvg'

import iconCompleted from 'legacy/assets/cow-swap/check.svg'
import { ButtonPrimary } from 'legacy/components/Button'
import { ExternalLink } from 'legacy/theme'

import * as styledEl from './styled'

export type BulletListItem = {
  content: string | React.ReactNode
  isNew?: boolean
}

type UnlockWidgetProps = {
  items: BulletListItem[]
  handleUnlock: () => void
  title: string
  subtitle: string
  buttonLink: string
  orderType: string
  buttonText: string
}

export function UnlockWidgetScreen({
  handleUnlock,
  buttonText,
  orderType,
  buttonLink,
  items,
  title,
  subtitle,
}: UnlockWidgetProps) {
  return (
    <styledEl.Container>
      <styledEl.TitleSection>
        <h3>{title}</h3>
        <strong>{subtitle}</strong>
      </styledEl.TitleSection>

      {items && (
        <styledEl.List>
          {items.map(({ isNew, content }, index) => (
            <li key={index} data-is-new={isNew || null}>
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
          Learn more about <ExternalLink href={buttonLink}>{orderType} orders ↗</ExternalLink>
        </span>
        <ButtonPrimary id={`unlock-${orderType}-orders-btn`} onClick={handleUnlock}>
          {buttonText}
        </ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
