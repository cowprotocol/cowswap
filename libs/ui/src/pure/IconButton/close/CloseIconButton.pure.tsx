import { ReactNode } from 'react'

import { useOnEscape } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'
import { X } from 'react-feather'

import { IconButton, SpecificIconButtonProps } from '../IconButton.pure'

export function CloseIconButton({ 'aria-label': ariaLabel = t`Close`, ...props }: SpecificIconButtonProps): ReactNode {
  useOnEscape(props.onClick)

  return <IconButton icon={X} aria-label={ariaLabel} {...props} />
}
