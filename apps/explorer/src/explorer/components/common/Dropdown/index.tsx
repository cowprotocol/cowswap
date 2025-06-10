import React, { createRef, DOMAttributes, ReactElement, useCallback, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import {
  BaseCard,
  DirectionDownwardsCSS,
  DirectionUpwardsCSS,
  DropdownItemCSS,
  DropdownItemProps,
  PositionCenterCSS,
  PositionLeftCSS,
  PositionRightCSS,
} from './styled'

import useOnClickOutside from '../../../../hooks/useOnClickOutside'

export enum DropdownPosition {
  center,
  left,
  right,
}

export enum DropdownDirection {
  downwards = 'down',
  upwards = 'up',
}

const Wrapper = styled.div<{ isOpen: boolean; disabled: boolean }>`
  outline: none;
  pointer-events: ${(props): string => (props.disabled ? 'none' : 'initial')};
  position: relative;
  z-index: ${(props): string => (props.isOpen ? '1' : 'initial')};

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`
const ButtonContainer = styled.div`
  background-color: transparent;
  border: none;
  display: block;
  outline: none;
  padding: 0;
  user-select: none;
  width: 100%;
`

export interface DropdownProps extends DOMAttributes<HTMLDivElement> {
  activeItemHighlight?: boolean | undefined
  className?: string
  closeOnClick?: boolean
  currentItem?: number | undefined
  disabled?: boolean
  items: Array<ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>>
  triggerClose?: boolean
  dropdownButtonContent?: React.ReactNode | string
  dropdownButtonContentOpened?: React.ReactNode | string
  dropdownDirection?: DropdownDirection | undefined
  dropdownPosition?: DropdownPosition | undefined
  callback?: Command
}

const Items = styled(BaseCard) <{
  dropdownDirection?: DropdownDirection
  dropdownPosition?: DropdownPosition
  fullWidth?: boolean
  isOpen: boolean
}>`
  background: ${Color.explorer_bg};
  border-radius: 0.6rem;
  border: 1px solid ${Color.explorer_border};
  box-shadow: ${Color.explorer_boxShadow};
  display: ${(props): string => (props.isOpen ? 'block' : 'none')};
  min-width: 160px;
  position: absolute;
  white-space: nowrap;

  ${({ fullWidth = false }) => (fullWidth ? 'width: 100%;' : '')}
  ${({ dropdownPosition = DropdownPosition.left }) => {
    switch (dropdownPosition) {
      case DropdownPosition.right:
        return PositionRightCSS
      case DropdownPosition.center:
        return PositionCenterCSS
      case DropdownPosition.left:
        return PositionLeftCSS
      default:
        return ''
    }
  }}
  ${({ dropdownDirection = DropdownDirection.downwards }) => {
    switch (dropdownDirection) {
      case DropdownDirection.downwards:
        return DirectionDownwardsCSS
      case DropdownDirection.upwards:
        return DirectionUpwardsCSS
      default:
        return ''
    }
  }}
`

export const DropdownOption = styled.li<DropdownItemProps>`
  ${DropdownItemCSS};
  list-style-type: none;
`

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const Dropdown: React.FC<DropdownProps> = (props) => {
  const {
    activeItemHighlight = true,
    className = '',
    closeOnClick = true,
    currentItem = 0,
    disabled = false,
    dropdownButtonContent = '▼',
    dropdownButtonContentOpened,
    dropdownDirection,
    dropdownPosition,
    items,
    callback,
  } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownContainerRef = createRef<HTMLDivElement>()
  useOnClickOutside(dropdownContainerRef, () => setIsOpen(false))

  const onButtonClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (disabled) return
      setIsOpen(!isOpen)
      callback && callback()
    },
    [callback, disabled, isOpen],
  )

  return (
    <Wrapper
      className={`dropdown-container ${isOpen ? 'dropdown-open' : ''} ${className}`}
      disabled={disabled}
      isOpen={isOpen}
      ref={dropdownContainerRef}
    >
      <ButtonContainer onClick={onButtonClick}>
        {dropdownButtonContentOpened && isOpen ? dropdownButtonContentOpened : dropdownButtonContent}
      </ButtonContainer>
      <Items
        className="dropdown-options"
        dropdownDirection={dropdownDirection}
        dropdownPosition={dropdownPosition}
        isOpen={isOpen}
      >
        {items.map((item, index) => {
          const isActive = activeItemHighlight && index === currentItem

          return React.cloneElement(item, {
            className: `dropdown-item ${isActive ? 'active' : ''}`,
            key: item.key || index,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()

              if (closeOnClick) {
                setIsOpen(false)
              }

              if (!item.props.onClick) {
                return
              }

              item.props.onClick(e)
            },
          })
        })}
      </Items>
    </Wrapper>
  )
}
