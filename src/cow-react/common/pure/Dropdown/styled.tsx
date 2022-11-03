import styled from 'styled-components/macro'

export interface DropdownContentPosition {
  positionX: 'right' | 'left'
  positionY: 'top' | 'bottom'
}

export const DropdownButton = styled.span`
  display: inline-block;
`

export const DropdownContent = styled.div<DropdownContentPosition>`
  position: absolute;
  z-index: 20;
  width: max-content;
  top: ${({ positionY }) => (positionY === 'top' ? '' : '100%')};
  bottom: ${({ positionY }) => (positionY === 'bottom' ? '' : '100%')};
  right: ${({ positionX }) => (positionX === 'right' ? '0' : '-100%')};
`

export const DropdownBox = styled.div`
  display: flex;
  position: relative;
`
