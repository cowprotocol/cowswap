import { ArrowDown } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { loadingAnimationMixin } from './style-mixins'

export const Box = styled.div<{ withRecipient: boolean; isCollapsed: boolean; hasSeparatorLine?: boolean }>`
  display: ${({ withRecipient }) => (withRecipient ? 'inline-flex' : 'block')};
  margin: ${({ withRecipient, isCollapsed }) => (withRecipient ? '0' : isCollapsed ? '-13px auto' : '2px auto')};
  cursor: pointer;
  position: relative;
  z-index: 2;
  width: ${({ withRecipient }) => (withRecipient ? '26px' : '100%')};
  height: 26px;
  justify-content: ${({ withRecipient }) => (withRecipient ? 'intial' : 'center')};
  transition: width 0.3s ease-in-out;

  ${({ hasSeparatorLine, withRecipient, theme }) =>
    hasSeparatorLine &&
    css`
      &::before {
        content: ${withRecipient ? 'none' : '""'};
        position: absolute;
        width: calc(100% + 20px);
        left: -10px;
        top: calc(50% - 1px);
        height: 1px;
        background: ${theme.grey1};
      }
    `}
`

export const LoadingWrapper = styled.div<{ isLoading: boolean; border?: boolean }>`
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
  border: ${({ border, theme }) => (border ? `1px solid ${theme.grey1}` : '0')};
  box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.bg1};
  background: ${({ theme }) => theme.grey1};
  border-radius: 8px;
  width: var(--size);
  margin: auto;

  &:hover {
    transform: translateY(-2px);
  }

  ${({ isLoading }) => isLoading && loadingAnimationMixin}
`

export const ArrowDownIcon = styled(ArrowDown)`
  display: block;
  margin: auto;
  stroke: ${({ theme }) => theme.text1};
  stroke-width: 3px;
  padding: 0;
  height: 100%;
  width: 20px;
  cursor: pointer;
`

export const CowImg = styled.img`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg4};
`
