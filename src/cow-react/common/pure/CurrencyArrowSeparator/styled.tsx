import styled, { css } from 'styled-components/macro'
import { ArrowDown } from 'react-feather'
import { loadingAnimationMixin } from './style-mixins'

export const Box = styled.div<{ withRecipient: boolean; isCollapsed: boolean; hasSeparatorLine?: boolean }>`
  display: ${({ withRecipient }) => (withRecipient ? 'inline-flex' : 'block')};
  margin: ${({ withRecipient, isCollapsed }) => (withRecipient ? '0' : isCollapsed ? '-12px auto' : '6px auto')};
  position: relative;
  z-index: 2;
  width: ${({ withRecipient }) => (withRecipient ? '28px' : '100%')};
  height: 28px;
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

export const LoadingWrapper = styled.div<{ isLoading: boolean }>`
  position: absolute;
  left: calc(50% - 14px);
  height: 100%;
  text-align: center;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 0.25s;
  border: 1px solid ${({ theme }) => theme.grey1};
  box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.bg1};
  background: ${({ theme }) => (theme.darkMode ? theme.grey1 : theme.white)};
  border-radius: 8px;
  width: 28px;
  margin: 0 auto;

  ${({ isLoading }) => isLoading && loadingAnimationMixin}
`

export const ArrowDownIcon = styled(ArrowDown)`
  stroke: ${({ theme }) => theme.text1};
  stroke-width: 2px;
  width: 100%;
  height: 100%;
  padding: 3px;
  cursor: pointer;
`

export const CowImg = styled.img`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg4};
`
