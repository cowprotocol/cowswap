import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
`

export const ChainButton = styled.button`
  display: inline-block;
  border-radius: 14px;
  padding: 6px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  cursor: pointer;
  line-height: 0;
  background: transparent;
  outline: none;

  &:hover {
    border-color: var(${UI.COLOR_TEXT_OPACITY_25});
  }

  &:focus {
    outline: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
  }

  > img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
`

export const TextButton = styled.span`
  height: 24px;
  min-width: 24px;
  padding: 0 2px;
  text-align: center;
  justify-content: space-around;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  gap: 4px;
`
