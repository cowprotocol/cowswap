import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'
import { BackButton } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { IconButton } from '../commonElements'

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: 500;
  padding: 16px;
  align-items: center;
  font-size: 17px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

export interface ModalHeaderProps {
  children: ReactNode
  onBack?(): void
  onClose?(): void
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ModalHeader({ children, className, onBack, onClose }: ModalHeaderProps) {
  return (
    <Header className={className}>
      {onBack && (
        <div>
          <BackButton onClick={onBack} />
        </div>
      )}
      <div>{children}</div>
      {onClose && (
        <div>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </div>
      )}
    </Header>
  )
}
