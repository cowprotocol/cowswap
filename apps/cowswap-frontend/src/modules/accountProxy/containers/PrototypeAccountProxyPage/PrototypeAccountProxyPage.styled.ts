import { ButtonError, ButtonPrimary, LinkStyledButton, Media, UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px 16px 16px;
`

export const AddressCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});

  ${Media.upToSmall()} {
    flex-direction: column;
    align-items: flex-start;
  }
`

export const AddressMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  > span:first-child {
    font-size: 13px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  > span:last-child {
    font-size: 17px;
    font-weight: 500;
  }
`

export const SummaryGrid = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

export const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const SummaryLabel = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const SummaryValue = styled.div`
  min-height: 34px;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
`

export const SummaryFallback = styled.span`
  font-size: 26px;
  font-weight: 600;
`

export const SummaryNote = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const WithdrawUnusedButton = styled(ButtonPrimary)`
  flex: 1;
  min-width: 220px;
`

export const WithdrawAllButton = styled(ButtonError)`
  flex: 1;
  min-width: 220px;
`

export const BannerWrapper = styled.div`
  margin-top: -2px;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
`

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const TokenCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});

  ${Media.upToSmall()} {
    flex-direction: column;
    align-items: flex-start;
  }
`

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

export const TokenText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

export const TokenTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;

  > b {
    font-size: 18px;
  }

  > span {
    font-size: 14px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const TokenNote = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TokenValueBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  ${Media.upToSmall()} {
    width: 100%;
    justify-content: space-between;
  }
`

export const TokenAmount = styled.span`
  font-size: 28px;
  font-weight: 600;
`

export const TokenActionLink = styled(Link)`
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 15px;
  font-weight: 500;
`

export const SectionToggle = styled(LinkStyledButton)`
  font-size: 14px;
`

export const EmptyState = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px dashed var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  line-height: 1.45;
`
