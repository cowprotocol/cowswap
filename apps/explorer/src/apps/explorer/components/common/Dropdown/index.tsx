import React, { DOMAttributes, useState, useCallback, createRef, ReactElement } from 'react'
import styled, { FlattenSimpleInterpolation } from 'styled-components'

import {
  BaseCard,
  PositionCenterCSS,
  PositionLeftCSS,
  PositionRightCSS,
  DirectionDownwardsCSS,
  DirectionUpwardsCSS,
  DropdownItemProps,
  DropdownItemCSS,
} from './styled'
import useOnClickOutside from 'hooks/useOnClickOutside'

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
  items: Array<ReactElement>
  triggerClose?: boolean
  dropdownButtonContent?: React.ReactNode | string
  dropdownButtonContentOpened?: React.ReactNode | string
  dropdownDirection?: DropdownDirection | undefined
  dropdownPosition?: DropdownPosition | undefined
  callback?: () => void
}

type CssString = FlattenSimpleInterpolation | string

const Items = styled(BaseCard)<{
  dropdownDirection?: DropdownDirection
  dropdownPosition?: DropdownPosition
  fullWidth?: boolean
  isOpen: boolean
}>`
  background: ${({ theme }): string => theme.bg1};
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  box-shadow: ${({ theme }): string => theme.boxShadow};
  display: ${(props): string => (props.isOpen ? 'block' : 'none')};
  min-width: 160px;
  position: absolute;
  white-space: nowrap;

  ${(props): CssString => (props.fullWidth ? 'width: 100%;' : '')}
  ${(props): CssString => (props.dropdownPosition === DropdownPosition.left ? PositionLeftCSS : '')}
  ${(props): CssString => (props.dropdownPosition === DropdownPosition.right ? PositionRightCSS : '')}
  ${(props): CssString => (props.dropdownPosition === DropdownPosition.center ? PositionCenterCSS : '')}
  ${(props): CssString => (props.dropdownDirection === DropdownDirection.downwards ? DirectionDownwardsCSS : '')}
  ${(props): CssString => (props.dropdownDirection === DropdownDirection.upwards ? DirectionUpwardsCSS : '')}
`

Items.defaultProps = {
  dropdownDirection: DropdownDirection.downwards,
  dropdownPosition: DropdownPosition.left,
  fullWidth: false,
  isOpen: false,
}

export const DropdownOption = styled.li<DropdownItemProps>`
  ${DropdownItemCSS}
  list-style-type: none;
`

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
        {items.map((item: ReactElement, index: number) => {
          const isActive = activeItemHighlight && index === currentItem

          return React.cloneElement(item, {
            className: `dropdown-item ${isActive && 'active'}`,
            key: item.key || index,
            onClick: (e: Event) => {
              e.stopPropagation()

              if (closeOnClick) {
                setIsOpen(false)
              }

              if (!item.props.onClick) {
                return
              }

              item.props.onClick()
            },
          })
        })}
      </Items>
    </Wrapper>
  )
}
