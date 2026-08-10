import { Command } from '@cowprotocol/types'

import { ReactNode } from 'react'

import * as styledEl from './OrderStepHeader.styled'
import { X, ArrowLeft } from 'react-feather'

export interface OrderStepHeaderProps {
  title: string
  badge: string; // TODO: Use type/enum
  onBack?: Command
  onClose?: Command
}

export function OrderStepHeader({ title, badge, onBack, onClose }: OrderStepHeaderProps): ReactNode {
  return (
    <styledEl.Header>
      { onBack && <styledEl.DismissinButton onClick={onBack}><ArrowLeft /></styledEl.DismissinButton>}
      <styledEl.Title>{title}</styledEl.Title>
      { badge && <styledEl.Badge>{badge}</styledEl.Badge>}
      {onClose && <styledEl.DismissinButton onClick={onClose}><X /></styledEl.DismissinButton>}
    </styledEl.Header>
  )
}
