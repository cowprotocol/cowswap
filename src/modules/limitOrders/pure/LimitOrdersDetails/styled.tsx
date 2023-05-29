import styled from 'styled-components/macro'

import { QuestionWrapper } from 'legacy/components/QuestionHelper'

import { RateInfo } from 'common/pure/RateInfo'

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

  > div > span {
    display: flex;
  }

  > div > span > p {
    opacity: 0.8;
    padding: 0;
    margin: 0;
  }

  > div > span ${QuestionWrapper} {
    opacity: 0.5;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
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
