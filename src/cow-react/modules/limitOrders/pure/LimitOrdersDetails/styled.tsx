import styled from 'styled-components/macro'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { transparentize } from 'polished'

export const DetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  min-height: 24px;
  gap: 3px;

  > div:first-child {
    display: flex;
    gap: 3px;
  }

  > div:first-child > span:first-child {
    transition: color 0.15s ease-in-out;
    color: ${({ theme }) => transparentize(0.2, theme.text1)};

    &:hover {
      color: ${({ theme }) => theme.text1};
    }
  }
`

export const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  min-height: 24px;
  gap: 3px;
`
