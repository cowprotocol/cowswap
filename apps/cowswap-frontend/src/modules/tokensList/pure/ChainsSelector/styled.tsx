import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
`

export const ShimmerItem = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  overflow: hidden;
  display: inline-block;
  margin-right: 8px;

  &:before {
    content: '';
    width: 36px;
    height: 36px;
    display: block;
    transform: translateX(-100%);
    ${({ theme }) => theme.shimmer};
  }
`

export const ChainButton = styled.button<{ active$?: boolean }>`
  display: inline-block;
  border-radius: 14px;
  padding: 6px;
  border: ${({ active$ }) => `1px solid var(${active$ ? UI.COLOR_TEXT_OPACITY_50 : UI.COLOR_TEXT_OPACITY_10})`};
  cursor: pointer;
  line-height: 0;
  background: transparent;
  outline: none;
  margin: 0 8px 8px 0;
  vertical-align: top;

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
