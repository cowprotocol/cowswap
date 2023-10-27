import { AutoRow } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { AutoColumn as AutoColumnUni } from 'legacy/components/Column'

export { default } from './CommonBasesMod'

export const AutoColumn = styled(AutoColumnUni)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;

    &::after {
      content: "";
      display: block;
      background: linear-gradient(to left, ${({ theme }) => theme.bg1} 0%, ${({ theme }) =>
    transparentize(1, theme.bg1)} 100%);
      pointer-events: none;
      height: 100%;
      width: 80px;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  `}
`

export const CommonBasesRow = styled(AutoRow)<{ gap?: string }>`
  margin: 0;
  flex-flow: row wrap;
  padding: 0;
  position: relative;

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
    padding: 0 100px 0 10px;
    flex-flow: row nowrap;
    overflow-x: scroll;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 100px 0 10px;
    flex-flow: row nowrap;
    overflow-x: scroll;
  `}
`

export const MobileWrapper = styled(AutoColumn)<{ showOverflow?: boolean }>`
  ${({ showOverflow }) =>
    showOverflow &&
    `
    ${CommonBasesRow} {
      padding: 0 0 20px 0;
    }

    &::after {
      content: '';
      display: block;
      pointer-events: none;
      height: 40px;
      width: 100%;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 85px;
      margin: auto;
    }
`}
`

export const BaseWrapperMod = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.bg3)};
  border-radius: 10px;
  display: flex;
  padding: 6px 8px;
  align-items: center;
  color: ${({ theme, disable }) => disable && theme.text3};
  background-color: ${({ theme, disable }) => disable && theme.bg3};
  filter: ${({ disable }) => disable && 'grayscale(1)'};
  flex: 0 1 auto;
  justify-content: center;

  &:hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.bg4};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: auto;
  `}
`

export const BaseWrapper = styled(BaseWrapperMod)<{ disable?: boolean }>`
  color: ${({ theme, disable }) => disable && transparentize(0.7, theme.text1)};
  filter: ${({ disable }) => disable && 'contrast(0.85)'};
`

export interface CommonBasesProps {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  className?: string
}
