import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RefundStatusType, RefundStatusEnum } from './RefundStatus'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const AmountSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  ${Media.upToSmall()} {
    > div {
      display: flex;
      flex-flow: column wrap;
      align-items: flex-start;
    }
  }
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

  ${Media.upToSmall()} {
    flex-direction: column;
    align-items: start;
  }
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
  border-radius: var(--provider-logo-size);
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
