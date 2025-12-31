import { isValidElement } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import iconCompleted from 'assets/cow-swap/check.svg'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

export type BulletListItem = {
  content: MessageDescriptor | React.ReactNode
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
  const { i18n } = useLingui()

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
              {isValidElement(content) ? content : i18n._(content as MessageDescriptor)}
            </li>
          ))}
        </styledEl.List>
      )}

      <styledEl.ControlSection>
        {buttonLink && (
          <span>
            <Trans>
              Learn more about <ExternalLink href={buttonLink}>{orderType} orders ↗</ExternalLink>
            </Trans>
          </span>
        )}
        <ButtonPrimary id={`unlock-${id}-btn`} onClick={handleUnlock}>
          {buttonText}
        </ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
