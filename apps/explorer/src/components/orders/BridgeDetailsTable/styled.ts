import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const TokenDisplayWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const FeesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const FeeItem = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const FeeLabel = styled.span`
  font-weight: bold;
`

export const FeeValue = styled.span``

export const AmountSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const AmountDetailBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const AmountLabel = styled.span`
  font-weight: normal;
  color: ${Color.explorer_textSecondary2};
  min-width: 60px;
`

export const AmountTokenDisplayAndCopyWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
`
