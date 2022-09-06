import styled from 'styled-components/macro'
import { Repeat } from 'react-feather'
import QuestionHelper from 'components/QuestionHelper'

export const Box = styled.div`
  margin: 15px 10px;
`

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.1rem;

  font-size: 13px;
  font-weight: 500;

  > :last-child {
    text-align: right;
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
  cursor: pointer;
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 5px;
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
`

export const LightText = styled.span`
  font-weight: 300;
`
