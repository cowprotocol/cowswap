import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RefundStatusType, RefundStatusEnum } from './RefundStatus'

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
  min-width: 6rem;
`

export const AmountTokenDisplayAndCopyWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
`

export const ProviderDisplayWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`

export const ProviderLogo = styled.img`
  --provider-logo-size: 1.8rem;
  width: var(--provider-logo-size);
  height: var(--provider-logo-size);
`

export const NetworkName = styled.span`
  margin-left: 0.5rem;
  color: ${Color.explorer_grey};
`

// RefundStatus styled components
export const RefundStatusText = styled.span<{ status: RefundStatusType }>`
  color: ${({ status }) => {
    switch (status) {
      case RefundStatusEnum.COMPLETED:
        return Color.explorer_green1
      case RefundStatusEnum.NOT_INITIATED:
      case RefundStatusEnum.PENDING:
      case RefundStatusEnum.FAILED:
      default:
        return Color.explorer_orange1
    }
  }};
  font-weight: 500;
`

export const RefundAddressWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const BridgeStatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const ErrorMessage = styled.div`
  font-size: 0.875rem;
  color: ${Color.explorer_red1};
  margin-top: 0.25rem;
`
