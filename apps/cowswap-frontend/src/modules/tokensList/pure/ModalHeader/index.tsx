import { ArrowLeft, X } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { IconButton } from '../commonElements'

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: 500;
  font-size: 20px;
  padding: 10px 0;
`

const StyledIconButton = styled(IconButton)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  font-size: 18px;
  font-weight: 600;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
`

export interface ModalHeaderProps {
  children: string
  onBack(): void
  onClose?(): void
  className?: string
}

export function ModalHeader({ children, className, onBack, onClose }: ModalHeaderProps) {
  return (
    <Header className={className}>
        <IconButton onClick={onBack}>
          <ArrowLeft />
        </IconButton>
      <Title>{children}</Title>
      { onClose && <div>
        <StyledIconButton onClick={onClose}>
          <X />
        </StyledIconButton>
      </div>
      }
    </Header>
  )
}
