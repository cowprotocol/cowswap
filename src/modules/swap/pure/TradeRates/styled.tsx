import styled from 'styled-components/macro'
import { Repeat } from 'react-feather'
import QuestionHelper from 'components/QuestionHelper'
import { RateInfo } from 'common/pure/RateInfo'
import { transparentize } from 'polished'

export const Box = styled.div`
  margin: 6px 8px;
`

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  min-height: 24px;
  gap: 3px;

  > div {
    display: flex;
    align-items: center;

    &:first-child {
      font-weight: 400;
      gap: 3px;
    }

    &:first-child > span {
      color: ${({ theme }) => transparentize(0.2, theme.text1)};
      transition: color 0.15s ease-in-out;

      &:hover {
        color: ${({ theme }) => theme.text1};
      }
    }

    &:last-child {
      text-align: right;
    }
  }
`

export const PriceSwitchButton = styled(Repeat)`
  cursor: pointer;
  border-radius: 20px;
  background: ${({ theme }) => theme.bg4};
  padding: 4px;
  vertical-align: middle;
  line-height: 0;
`

export const QuestionHelperWrapped = styled(QuestionHelper)`
  display: inline-block;
  vertical-align: middle;
  line-height: 0;
`

export const Discount = styled.span`
  margin: auto;
  display: flex;
  cursor: pointer;
  padding: 2px 8px;
  background: ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};
  border-radius: 5px;
  font-weight: 400;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.white};
  }
`

export const LightText = styled.span`
  font-weight: 300;
`

export const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 500;
  min-height: 24px;
`
