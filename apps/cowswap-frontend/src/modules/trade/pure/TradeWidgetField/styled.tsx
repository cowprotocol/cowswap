import { transparentize } from 'polished'
import styled, { css } from 'styled-components/macro'

import { QuestionWrapper } from 'legacy/components/QuestionHelper'

import { NumericalInput } from '../TradeNumberInput/styled'

export const TradeWidgetFieldLabel = styled.span`
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  flex: 0 1 auto;
  flex: 1;

  ${QuestionWrapper} {
    opacity: 0.5;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export const Content = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  position: relative;
`

export const ErrorText = styled.div<{ type?: 'error' | 'warning' }>`
  color: ${({ theme, type }) => {
    if (type === 'error') return theme.red1
    else if (type === 'warning') return theme.yellow2
    else return theme.text1
  }};
  font-size: 12px;
  margin-top: 5px;
`

export const TradeWidgetFieldBox = styled.div<{ hasPrefix?: boolean }>`
  --minHeight: 45px;
  background: ${({ theme, hasPrefix }) => (hasPrefix ? 'transparent' : theme.grey1)};
  border: 1px solid ${({ theme, hasPrefix }) => (hasPrefix ? theme.grey1 : 'transparent')};
  border-radius: 16px;
  min-height: var(--minHeight);
  font-size: 18px;
  padding: 10px 16px;
  padding: ${({ hasPrefix }) => (hasPrefix ? '0' : '10px 16px')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row wrap;
  flex: 1;
  gap: 3px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 0;
  `};

${({ hasPrefix }) =>
  hasPrefix &&
  css`
    display: grid;
    grid-template-columns: max-content auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: flex;
      flex-flow: column wrap;
    `};
  `}

  ${TradeWidgetFieldLabel} {
    padding: ${({ hasPrefix }) => (hasPrefix ? '10px 16px' : 'initial')};
  }

  ${Content} {
    padding: 0;
    flex: 0 1 auto;

    ${NumericalInput} {
      max-width: 200px;
      appearance: textfield;
    };
    
    ${({ hasPrefix }) =>
      hasPrefix &&
      css`
        flex: 1 1 auto;
        justify-content: center;
        display: flex;
        padding: 0;
        height: var(--minHeight);

        ${({ theme }) => theme.mediaWidth.upToSmall`
          border-top: 1px solid ${theme.grey1};
          width: 100%;
        `};
      `}

    > em {
      font-style: normal;
      flex: 1 1 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 12px 0 0;
    }

    > span {
      background: ${({ theme, hasPrefix }) => (hasPrefix ? theme.grey1 : 'transparent')};

      ${({ hasPrefix }) =>
        hasPrefix &&
        css`
          margin: auto;
          height: 100%;
          display: flex;
          padding: 0 10px 0 0;
          flex: 0 1 auto;
          border-radius: 0 15px 15px 0;
          align-items: center;

          ${({ theme }) => theme.mediaWidth.upToSmall`
            border-radius: 0 0 15px 0;
            width: 136px;
          `};

          > ${NumericalInput} {
            font-size: 18px;
            width: 56px;
          }
        `}
  }
`
