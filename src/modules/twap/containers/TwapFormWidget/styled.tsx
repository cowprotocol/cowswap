import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Row = styled.div`
  display: flex;
  grid-gap: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 6px;
  `}
`

export const DeadlineRow = styled(Row)`
  grid-gap: 0;
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
`

export const StyledRateInfo = styled(RateInfo)`
  padding: 10px;
  gap: 4px;
  font-size: 13px;
  min-height: 24px;
  display: grid;
  grid-template-columns: max-content auto;
`
