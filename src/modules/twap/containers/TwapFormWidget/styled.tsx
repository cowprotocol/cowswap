import styled from 'styled-components/macro'

import { QuestionWrapper } from 'legacy/components/QuestionHelper'

import { RateInfo } from 'common/pure/RateInfo'

export const Row = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 6px;
  `}

  ${QuestionWrapper} {
    opacity: 0.5;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export const StyledRateInfo = styled(RateInfo)`
  padding: 10px;
  gap: 4px;
  font-size: 13px;
  min-height: 24px;
  display: grid;
  grid-template-columns: max-content auto;
`

export const StyledPriceProtection = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
`
