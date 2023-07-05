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

export const TradeWidgetFieldBox = styled.div<{ inputType?: string }>`
  background: ${({ theme, inputType }) => (inputType === 'priceProtection' ? 'transparent' : theme.grey1)};
  border: 1px solid ${({ theme, inputType }) => (inputType === 'priceProtection' ? theme.grey1 : 0)};
  border-radius: 16px;
  min-height: 45px;
  font-size: 18px;
  padding: 10px 16px;
  padding: ${({ inputType }) => (inputType === 'priceProtection' ? '0' : '10px 16px')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row wrap;
  flex: 1;
  gap: 3px;

  ${TradeWidgetFieldLabel} {
    padding: ${({ inputType }) => (inputType === 'priceProtection' ? '10px 16px' : 'initial')};
  }

  ${Content} {
    padding: ${({ inputType }) => (inputType === 'priceProtection' ? '10px 88px 10px 16px' : 'initial')};

    > em {
      font-style: normal;
    }

    > span {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: ${({ theme, inputType }) => (inputType === 'priceProtection' ? theme.grey1 : 'transparent')};

      ${({ inputType }) => inputType === 'priceProtection' && css`
        position: absolute;
        top: -1px;
        right: 0;
        height: calc(100% + 2px);
        width: 76px;
        border-radius: 0 15px 15px 0;
        padding: 0 16px 0 0;

        > ${NumericalInput} {
          font-size: 20px;
        }
      `
      }
  }
`
