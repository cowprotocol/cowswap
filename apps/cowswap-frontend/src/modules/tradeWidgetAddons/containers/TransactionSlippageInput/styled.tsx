import { FancyButton, Loader, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${Media.upToSmall()} {
    display: none;
  }
`

export const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  background: var(${({ active }) => (active ? UI.COLOR_PRIMARY : UI.COLOR_PRIMARY_OPACITY_50)});
  transition: background-color 0.2s;

  :hover {
    cursor: pointer;
    background: var(${UI.COLOR_PRIMARY});
  }

  &:disabled {
    border: none;
    pointer-events: none;
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
export const Input = styled.input`
  font-size: 16px;
  outline: none;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 2rem;
  background: transparent;
  color: inherit;

  &:disabled {
    color: inherit;
    background-color: inherit;
  }

  &::placeholder {
    opacity: 0.5;
    color: inherit;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  text-align: right;
`

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 0;
  text-align: right;
`

export const SlippageLoader = styled(Loader)`
  margin-top: 4px;
`
