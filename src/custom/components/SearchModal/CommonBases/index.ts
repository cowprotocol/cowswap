import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import { AutoRow } from 'components/Row'
import { AutoColumn as AutoColumnUni } from 'components/Column'
import { BaseWrapperMod } from './CommonBasesMod'
import { transparentize } from 'polished'

export { default } from './CommonBasesMod'

export const AutoColumn = styled(AutoColumnUni)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;

    &::after {
      content: "";
      display: block;
      background: linear-gradient(to left, ${({ theme }) => theme.bg3} 0%, ${({ theme }) =>
    transparentize(1, theme.bg3)} 100%);
      pointer-events: none;
      height: 100%;
      width: 70px;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  `}
`

export const CommonBasesRow = styled(AutoRow)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: row nowrap;
    overflow-x: scroll;
    padding: 0 100px 0 0;
    position: relative;
    scrollbar-color: ${({ theme }) => theme.scrollbarThumb} ${({ theme }) => theme.scrollbarBg};
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      height: 10px;
      background: ${({ theme }) => theme.scrollbarBg};
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.scrollbarThumb};
      border: 3px solid transparent;
      border-radius: 10px;
      background-clip: padding-box;
    }
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
      background: linear-gradient(to top, #163861 0%, rgba(22, 56, 97, 0) 100%);
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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    /* display: none; */
  `};

  overflow-y: auto;
  max-height: 150px;
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
