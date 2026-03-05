import { Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Card } from 'common/pure/AccountCard'

import { MetaRow } from './AffiliateMetrics.shared'

export const HeroCard = styled(Card)`
  max-width: 520px;
  align-items: center;
  justify-content: center;
  text-align: center;
`

export const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`

export const HeroTitle = styled.h2`
  margin: 0;
  width: 100%;
  padding: 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  text-align: center;
`

export const HeroSubtitle = styled.p`
  margin: 0;
  width: 100%;
  font-size: 15px;
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  text-align: center;

  a {
    color: var(${UI.COLOR_LINK});
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const HeroActions = styled.div`
  display: flex;
  justify-content: center;
  min-width: 320px;
`

const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
`

export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 2.5fr) minmax(0, 1.5fr);
  gap: 16px;

  ${Media.upToLarge()} {
    grid-template-columns: 1fr;
  }
`

export const ColumnOneCard = styled(CardStack)`
  grid-column: 1 / 2;
  grid-row: 1;
  align-items: center;

  ${Media.upToLarge()} {
    grid-column: 1 / -1;
    grid-row: auto;
  }
`

export const ColumnTwoCard = styled(CardStack)`
  grid-column: 2 / 3;
  grid-row: 1;

  ${Media.upToLarge()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const ColumnThreeCard = styled(CardStack)`
  grid-column: 3 / 4;
  grid-row: 1;
  align-items: center;

  ${Media.upToLarge()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-weight: 600;
`

export const LinkedCard = styled.div`
  border: 1px solid var(${UI.COLOR_INFO_BG});
  background: var(${UI.COLOR_PAPER});
  border-radius: 9px;
  overflow: hidden;
  width: 100%;
`

export const LinkedCodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
`

export const LinkedCodeText = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
  color: inherit;
  font-family: ${Font.familyMono};
`

export const LinkedMetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  width: 100%;
`

export const LinkedCopy = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const LinkedLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  border-top: 1px solid var(${UI.COLOR_BORDER});
`

export const LinkedLinkText = styled.span`
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const IneligibleCard = styled(Card)`
  max-width: 520px;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  position: relative;
`

export const IneligibleImage = styled.img`
  filter: grayscale(100%) opacity(0.5);
`

export const IneligibleTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

export const IneligibleSubtitle = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  max-width: 520px;

  strong {
    color: var(${UI.COLOR_TEXT});
  }
`

export const UnsupportedNetworkCard = styled(Card)`
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

export const UnsupportedNetworkHeader = styled.h2`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  color: var(${UI.COLOR_DANGER});
  font-weight: 600;
`

export const UnsupportedNetworkMessage = styled.p`
  margin: 0;
  text-align: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const LinkedFooterNote = styled(MetaRow)`
  width: 100%;
  justify-content: center;
  text-align: center;
`

export const PayoutValue = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  align-items: center;
  gap: 12px;
`
