import iconCompleted from '@cowprotocol/assets/cow-swap/check.svg'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

export type BulletListItem = {
  content: string | React.ReactNode
  isNew?: boolean
}

type UnlockWidgetProps = {
  id: string
  items: BulletListItem[]
  handleUnlock: Command
  title: string
  subtitle: string
  buttonLink?: string
  orderType: string
  buttonText: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UnlockWidgetScreen({
  id,
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
        {buttonLink && (
          <span>
            Learn more about <ExternalLink href={buttonLink}>{orderType} orders ↗</ExternalLink>
          </span>
        )}
        <ButtonPrimary id={`unlock-${id}-btn`} onClick={handleUnlock}>
          {buttonText}
        </ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
