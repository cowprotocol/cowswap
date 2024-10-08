import { FancyButton, Media, RowBetween, RowFixed, UI } from '@cowprotocol/ui'

import { darken } from 'color2k'
import styled from 'styled-components/macro'

export const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;

  :hover {
    cursor: pointer;
  }

  &:disabled {
    border: none;
    pointer-events: none;
  }
`

export const Input = styled.input`
  background: var(${UI.COLOR_PAPER});
  font-size: 16px;
  width: auto;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  color: ${({ theme, color }) => (color === 'red' ? theme.error : `var(${UI.COLOR_TEXT})`)};
  text-align: right;
`

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.error : theme.bg2}`};

  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(theme.error, 0.1) : darken(theme.bg2, 0.1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 2rem;
  }
`

export const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${Media.upToSmall()} {
    display: none;
  }
`

export const SmartSlippageInfo = styled.div`
  color: var(${UI.COLOR_GREEN});
  font-size: 13px;
  text-align: right;
  width: 100%;
  padding-right: 0.2rem;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 0.35rem;

  > span {
    margin-left: 4px;
  }
`

export const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
      background-color: var(${UI.COLOR_PAPER});
      border: none;
      pointer-events: none;
    }
  }

  ${OptionCustom} {
    background-color: var(${UI.COLOR_PAPER_DARKER});
    border: 0;
    color: inherit;

    > div > input {
      background: transparent;
      color: inherit;

      &:disabled {
        color: inherit;
        background-color: inherit;
      }
    }

    > div > input::placeholder {
      opacity: 0.5;
      color: inherit;
    }
  }

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }

    > button {
      background-color: var(${UI.COLOR_PAPER_DARKER});
      border: 0;
    }

    > button > input {
      background: transparent;
      color: inherit;
    }

    > button > input::placeholder {
      background: transparent;
      opacity: 0.5;
      color: inherit;
    }
  }
`
