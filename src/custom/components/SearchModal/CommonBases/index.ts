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

export const BaseWrapper = styled(BaseWrapperMod)<{ disable?: boolean }>`
  color: ${({ theme, disable }) => disable && transparentize(0.7, theme.text1)};
  filter: ${({ disable }) => disable && 'contrast(0.85)'};
`

export const CommonBasesRow = styled(AutoRow)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: row nowrap;
    overflow-x: scroll;
    padding: 0 100px 0 0;
    position: relative;
  `}
`

export interface CommonBasesProps {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  className?: string
}
