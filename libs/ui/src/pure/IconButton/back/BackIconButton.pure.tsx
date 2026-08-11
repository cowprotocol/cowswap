import { ReactNode } from 'react'

import { useOnEscape } from '@cowprotocol/common-hooks'

import { ArrowLeft } from 'react-feather'

import { IconButton, SpecificIconButtonProps } from '../IconButton.pure'

export function BackIconButton(props: SpecificIconButtonProps): ReactNode {
  useOnEscape(props.onClick)

  return <IconButton icon={ArrowLeft} {...props} />
}
