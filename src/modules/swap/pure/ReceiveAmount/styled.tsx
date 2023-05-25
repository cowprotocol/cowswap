import styled from 'styled-components/macro'
import QuestionHelper from 'legacy/components/QuestionHelper'

export const ReceiveAmountBox = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 0 0 16px 16px;
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.grey1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: start;
    gap: 0.5rem;
  `};

  > div {
    display: flex;
    align-items: center;

    &:first-child {
      font-weight: 500;
    }

    &:last-child {
      text-align: right;
    }
  }
`

export const ReceiveAmountValue = styled.span`
  font-size: 21px;
`

export const QuestionHelperWrapped = styled(QuestionHelper)`
  display: inline-block;
  vertical-align: bottom;
  line-height: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`
