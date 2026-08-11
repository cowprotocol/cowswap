import { ReactNode } from 'react'

import { useOnEscape } from '@cowprotocol/common-hooks'

import { X } from 'react-feather'

import { IconButton, SpecificIconButtonProps } from '../IconButton.pure'

export function CloseIconButton(props: SpecificIconButtonProps): ReactNode {
  useOnEscape(props.onClick)

  return <IconButton icon={X} {...props} />
}
