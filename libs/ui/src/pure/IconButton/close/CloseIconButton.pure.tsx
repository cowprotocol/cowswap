import { ReactNode } from 'react'

import { useOnEscape } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'
import { IconProps, X } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../../enum'
import { IconButton, SpecificIconButtonProps } from '../IconButton.pure'

const CLOSE_ICON_SIZE = 24
const CLOSE_BUTTON_SIZE = 44

function CloseIcon(props: IconProps): ReactNode {
  return <X {...props} strokeWidth={2} />
}

const Button = styled(IconButton)`
  flex: 0 0 ${CLOSE_BUTTON_SIZE}px;
  width: ${CLOSE_BUTTON_SIZE}px;
  height: ${CLOSE_BUTTON_SIZE}px;
  border-radius: 8px;

  > svg {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:not(:disabled):hover > svg,
  &:not(:disabled):focus-visible > svg,
  &:not(:disabled):active > svg {
    opacity: 1;
  }
`

export interface CloseIconButtonProps extends Omit<SpecificIconButtonProps, 'color' | 'colorHover' | 'size'> {
  /** Disable for overlays whose dialog primitive already owns Escape handling. */
  closeOnEscape?: boolean
}

export function CloseIconButton({
  'aria-label': ariaLabel = t`Close`,
  closeOnEscape = true,
  ...props
}: CloseIconButtonProps): ReactNode {
  useOnEscape(closeOnEscape ? props.onClick : undefined)

  return (
    <Button
      icon={CloseIcon}
      size={CLOSE_ICON_SIZE}
      color={`var(${UI.COLOR_TEXT})`}
      colorHover={`var(${UI.COLOR_TEXT})`}
      aria-label={ariaLabel}
      {...props}
    />
  )
}
