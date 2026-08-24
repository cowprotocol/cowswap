import { ReactNode } from 'react'

import { ModalHeader } from '../ModalHeader'

export interface ResolveOverlayHeaderParams {
  header?: ReactNode
  title?: ReactNode
  onBack?: () => void
  onClose(): void
}

export function getOverlayA11yTitle(title: ReactNode | undefined, fallback: string): string {
  return typeof title === 'string' ? title : fallback
}

export function resolveOverlayHeader({ header, title, onBack, onClose }: ResolveOverlayHeaderParams): ReactNode {
  if (header) {
    return header
  }

  if (title || onBack) {
    return <ModalHeader title={title} onBack={onBack} onClose={onClose} />
  }

  return undefined
}
