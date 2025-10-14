import { InlineBanner, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { AccordionBanner } from 'common/pure/AccordionBanner'

export const UnfillableWarning = styled(InlineBanner)`
  margin: 10px 0;
  padding: 10px;
  font-size: 13px;
`

export const ApproveWrapper = styled.div`
  width: 100%;
  color: var(${UI.COLOR_TEXT});
`

export const Subtitle = styled.div`
  margin: 10px 30px 10px;
  color: var(${UI.COLOR_RED});
  font-size: 13px;
`

export const OrderActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const WrappedAccordionBanner = styled(AccordionBanner)`
  margin: 10px 0;
`

export const Title = styled.div<{ marginLeft?: string }>`
  margin-left: ${({ marginLeft }) => marginLeft || '0'};
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 6px;
`
