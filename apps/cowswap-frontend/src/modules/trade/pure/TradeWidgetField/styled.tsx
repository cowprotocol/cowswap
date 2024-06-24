import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { NumericalInput } from '../TradeNumberInput/styled'

export const TradeWidgetFieldLabel = styled.span`
  color: inherit;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  flex: 0 1 auto;
  flex: 1;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
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
    if (type === 'error') return theme.error
    else if (type === 'warning') return '#FF8F00'
    else return theme.text1
  }};
  font-size: 12px;
  margin-top: 5px;
`

export const TradeWidgetFieldBox = styled.div<{ hasPrefix?: boolean }>`
  --minHeight: 45px;
  background: ${({ hasPrefix }) => (hasPrefix ? 'transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
  border: 1px solid ${({ hasPrefix }) => (hasPrefix ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
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

  ${Media.upToSmall()} {
    gap: 0;
  }

  ${({ hasPrefix }) =>
    hasPrefix &&
    css`
      display: grid;
      grid-template-columns: max-content auto;
      grid-template-rows: max-content;

      ${Media.upToSmall()} {
        display: flex;
        flex-flow: column wrap;
      }
    `}

  ${TradeWidgetFieldLabel} {
    padding: ${({ hasPrefix }) => (hasPrefix ? '10px 16px' : 'initial')};
  }

  ${Content} {
    padding: 0;
    flex: 0 1 auto;
    color: inherit;

    ${NumericalInput} {
      max-width: 200px;
      appearance: textfield;
    }

    ${({ hasPrefix }) =>
      hasPrefix &&
      css`
        flex: 1 1 auto;
        justify-content: center;
        display: flex;
        padding: 0;
        height: var(--minHeight);

        ${Media.upToSmall()} {
          border-top: 1px solid var(${UI.COLOR_PAPER_DARKER});
          width: 100%;
        }
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
      background: ${({ hasPrefix }) => (hasPrefix ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};

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

          ${Media.upToSmall()} {
            border-radius: 0 0 15px 0;
            width: 136px;
          }

          > ${NumericalInput} {
            font-size: 18px;
            width: 56px;
          }
        `}
    }
  }
`
