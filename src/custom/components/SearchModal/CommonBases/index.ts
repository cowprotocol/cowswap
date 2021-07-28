import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import { AutoRow } from 'components/Row'
import { AutoColumn as AutoColumnUni } from 'components/Column'

export { default } from './CommonBasesMod'

export const AutoColumn = styled(AutoColumnUni)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;

    &::after {
      content: "";
      display: block;
      background: linear-gradient(to left, ${({ theme }) => theme.bg3} 0%, ${({ theme }) => theme.bg3Transparent} 100%);
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
  `}
`

export interface CommonBasesProps {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  className?: string
}
