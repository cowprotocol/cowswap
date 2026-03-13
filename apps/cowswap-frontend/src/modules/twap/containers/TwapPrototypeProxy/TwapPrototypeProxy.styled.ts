import { ButtonSecondary, LinkStyledButton, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const BannerWrapper = styled.div`
  margin: 2px auto 12px;
  width: 100%;
`

export const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px 20px;
`

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 21px;
  line-height: 1.2;
`

export const ModalDescription = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const SummaryCard = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: var(${UI.COLOR_PAPER_DARKER});
  line-height: 1.6;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  line-height: 1.3;
`

export const SectionNote = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_BORDER});
`

export const AddressMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  > span:first-child {
    font-size: 13px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const TokenCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_BORDER});
`

export const TokenMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const TokenSubline = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TokenActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`

export const EmptyState = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px dashed var(${UI.COLOR_BORDER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  line-height: 1.45;
`

export const SecondaryButton = styled(ButtonSecondary)`
  min-width: 180px;
`

export const InlineActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const BannerLink = styled(LinkStyledButton)`
  display: inline;
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const BannerText = styled.span`
  && {
    width: auto;
    display: inline;
    line-height: 1.4;
    gap: 0;
  }
`
