import { UI } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { loadingAnimationMixin } from './style-mixins'

export const Box = styled.div<{
  isCollapsed: boolean
  hasSeparatorLine?: boolean
  disabled: boolean
}>`
  display: block;
  margin: ${({ isCollapsed }) => (isCollapsed ? '-13px auto' : '2px auto')};
  cursor: ${({ disabled }) => (disabled ? 'inherit' : 'pointer')};
  color: inherit;
  position: relative;
  z-index: 2;
  width: 100%;
  height: 26px;
  justify-content: center;
  transition: width var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ hasSeparatorLine }) =>
    hasSeparatorLine &&
    css`
      &::before {
        content: '';
        position: absolute;
        width: calc(100% + 16px);
        left: -8px;
        top: calc(50% - 1px);
        height: 1px;
        background: var(${UI.COLOR_PAPER_DARKER});
      }
    `}
`

export const LoadingWrapper = styled.div<{ isLoading: boolean }>`
  --size: 26px;
  position: absolute;
  left: calc(50% - var(--size) / 2);
  top: 0;
  bottom: 0;
  height: 100%;
  text-align: center;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 0.25s;
  border: 0;
  box-shadow: 0 0 0 3px var(${UI.COLOR_PAPER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border-radius: 8px;
  width: var(--size);
  margin: auto;

  &:hover {
    transform: translateY(-2px);
  }

  ${({ isLoading }) => isLoading && loadingAnimationMixin}
`

export const ArrowDownIcon = styled(ArrowDown)<{ disabled: boolean }>`
  display: block;
  margin: auto;
  stroke: currentColor;
  stroke-width: 3px;
  padding: 0;
  height: 100%;
  width: 20px;
  cursor: ${({ disabled }) => (disabled ? 'inherit' : 'pointer')};
  color: inherit;
`

export const CowImg = styled.img`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.paperCustom};
`
