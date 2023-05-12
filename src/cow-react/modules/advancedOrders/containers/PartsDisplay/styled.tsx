import styled from 'styled-components/macro'
import { WidgetField, WidgetLabel } from '../../pure/WidgetField'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  display: flex;
  grid-gap: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 6px;
  `}
`

export const Part = styled(WidgetField)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.grey1};
`

export const Label = styled(WidgetLabel)`
  font-size: 12px;
`

export const Value = styled.div`
  font-size: 20px;
  font-weight: 500;
  padding: 7px 0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;

  > div:first-child {
    margin-right: 5px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 18px;
    padding: 5px 0;
  `}
`

export const Fiat = styled(FiatAmount)`
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
  font-size: 13px;
`
