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

export const CommonBasesRow = styled(AutoRow)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: row nowrap;
    overflow-x: scroll;
    padding: 0 100px 0 0;
    position: relative;
    ${({ theme }) => theme.colorScrollbar};
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
      // background: linear-gradient(to top, #163861 0%, rgba(22, 56, 97, 0) 100%);
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

  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  max-height: 135px;
  padding-bottom: 20px;
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
