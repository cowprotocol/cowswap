import styled, { css } from 'styled-components'

export const BaseCard = styled.div<{ noPadding?: boolean }>`
  background-color: ${({ theme }): string => theme.bg1};
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  display: flex;
  flex-direction: column;
  position: relative;
`

BaseCard.defaultProps = {
  noPadding: false,
}

export const DropdownTextCSS = css`
  color: ${({ theme }): string => theme.textPrimary1};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: normal;
  white-space: nowrap;
`

export const PositionLeftCSS = css`
  left: 0;
`

export const PositionRightCSS = css`
  right: 0;
`

export const PositionCenterCSS = css`
  left: 50%;
  transform: translateX(-50%);
`

export const DirectionDownwardsCSS = css`
  top: calc(100% + 10px);
`

export const DirectionUpwardsCSS = css`
  bottom: calc(100% + 10px);
`

export interface DropdownItemProps {
  disabled?: boolean
}

export const DropdownItemCSS = css<DropdownItemProps>`
  align-items: center;
  background-color: ${(props): string => props.theme.bg1};
  border-bottom: 1px solid ${(props): string => props.theme.borderPrimary};
  color: ${(props): string => props.theme.textPrimary1};
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-default);
  font-weight: 400;
  line-height: 1.4;
  min-height: 37px;
  overflow: hidden;
  padding: 10px 13px;
  text-decoration: none;
  user-select: none;

  &.active {
    background-color: var(--color-gradient-2);
    color: var(--color-text-primary);
    font-weight: 600;
  }

  &:first-child {
    border-top-left-radius: 0.6rem;
    border-top-right-radius: 0.6rem;
  }

  &:last-child {
    border-bottom-left-radius: 0.6rem;
    border-bottom-right-radius: 0.6rem;
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-gradient-1);
  }

  &:disabled,
  &[disabled] {
    &,
    &:hover {
      background-color: transparent;
      cursor: not-allowed;
      font-weight: 400;
      opacity: 0.5;
      pointer-events: none;
    }
  }
`
