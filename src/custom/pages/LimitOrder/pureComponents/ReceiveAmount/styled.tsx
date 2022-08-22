import styled from 'styled-components/macro'
import QuestionHelper from 'components/QuestionHelper'

export const ReceiveAmountBox = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 1rem;
  border-radius: 0 0 15px 15px;
  border: 2px solid ${({ theme }) => theme.border2};

  font-size: 14px;
  font-weight: 600;

  > :last-child {
    text-align: right;
  }
`

export const ReceiveAmountValue = styled.span`
  font-size: 18px;
`

export const QuestionHelperWrapped = styled(QuestionHelper)`
  display: inline-block;
  vertical-align: middle;
  line-height: 0;
`
