import { ReactNode } from 'react'

import { useOnEscape } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'react-feather'

import { UI } from '../../../enum'
import { IconButton, SpecificIconButtonProps } from '../IconButton.pure'

export function BackIconButton({ 'aria-label': ariaLabel = t`Back`, ...props }: SpecificIconButtonProps): ReactNode {
  useOnEscape(props.onClick)

  return (
    <IconButton
      color={`var(${UI.COLOR_TEXT})`}
      colorHover={`var(${UI.COLOR_TEXT_OPACITY_50})`}
      icon={ArrowLeft}
      aria-label={ariaLabel}
      {...props}
    />
  )
}
