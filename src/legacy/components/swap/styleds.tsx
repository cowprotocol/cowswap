import { MouseEventHandler, ReactNode } from 'react'

import { transparentize } from 'polished'
import { AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { css } from 'styled-components/macro'

import { TooltipContainer } from 'legacy/components/Tooltip'
import { ThemedText } from 'legacy/theme'

import { FeeInformationTooltipWrapper } from './FeeInformationTooltip'

import { AutoColumn } from '../Column'

export const Container = styled.div`
  max-width: 460px;
  width: 100%;
`
export const Wrapper = styled.div`
  position: relative;
  padding: 8px;
`

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -14px;
  margin-bottom: -14px;
  left: 16px;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text1
      : theme.text2};
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  max-width: 220px;
  overflow: hidden;
  text-align: right;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div<{ $css?: string }>`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.red1};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }

  ${({ $css }) => $css}
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

const Closer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  padding: 7px 10px;
  font-weight: bold;
  cursor: pointer;
`

export type ErrorMessageProps = {
  error?: ReactNode
  handleClose?: MouseEventHandler<HTMLDivElement>
  showClose?: boolean
  $css?: string
}

export function SwapCallbackError({ error, handleClose, showClose, ...styleProps }: ErrorMessageProps) {
  return (
    <SwapCallbackErrorInner {...styleProps}>
      {showClose && <Closer onClick={handleClose}>X</Closer>}
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.primary3)};
  color: ${({ theme }) => theme.primaryText1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const TransactionDetailsLabel = styled(ThemedText.Black)`
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  padding-bottom: 0.5rem;
`

export const ResponsiveTooltipContainer = styled(TooltipContainer)<{ origin?: string; width?: string }>`
  background-color: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.bg2};
  padding: 1rem;
  width: ${({ width }) => width ?? 'auto'};

  ${({ theme, origin }) => theme.mediaWidth.upToExtraSmall`
    transform: scale(0.8);
    transform-origin: ${origin ?? 'top left'};
  `}
`
// TODO: refactor these styles
export const AuxInformationContainer = styled.div<{
  margin?: string
  borderColor?: string
  borderWidth?: string
  hideInput: boolean
  disabled?: boolean
  showAux?: boolean
}>`
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};

  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }

  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
      :focus,
      :hover {
        border: 1px solid ${hideInput ? ' transparent' : theme.bg3};
      }
    `}

  margin: ${({ margin = '0 auto' }) => margin};
  border-radius: 0 0 15px 15px;
  border: 2px solid ${({ theme }) => theme.grey1};

  &:hover {
    border: 2px solid ${({ theme }) => theme.grey1};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: auto;
    flex-flow: column wrap;
    justify-content: flex-end;
    align-items: flex-end;
  `}
  > ${FeeInformationTooltipWrapper} {
    align-items: center;
    justify-content: space-between;
    margin: 0 16px;
    padding: 16px 0;
    font-weight: 600;
    font-size: 14px;
    height: auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      width: 100%;
      align-items: flex-start;
      margin: 0;
      padding: 16px;
    `}
    > span {
      font-size: 18px;
      gap: 2px;
      word-break: break-all;
      text-align: right;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        text-align: left;
        align-items: flex-start;
        width: 100%;
      `};
    }

    > span:first-child {
      font-size: 14px;
      display: flex;
      align-items: center;
      white-space: nowrap;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 0 0 10px;
      `}
    }

    > span > small {
      opacity: 0.75;
      font-size: 13px;
      font-weight: 500;
    }
  }
`
