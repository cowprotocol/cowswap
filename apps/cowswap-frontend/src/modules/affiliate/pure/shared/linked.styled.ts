import { ButtonOutlined, Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { MetaRow } from './metrics.styled'

export const LinkedCardGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`

export const LinkedCard = styled.div`
  border: 1px solid var(${UI.COLOR_INFO_BG});
  background: var(${UI.COLOR_PAPER});
  border-radius: 9px;
  overflow: hidden;
  width: 100%;
`

export const LinkedCodeRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 12px;
  min-width: 0;
  padding: 14px 10px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});

  > :first-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  > :last-child {
    flex: 0 0 auto;
  }
`

export const LinkedCodeText = styled.span`
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  font-weight: 700;
  font-size: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: inherit;
  font-family: ${Font.familyMono};

  ${Media.upToSmall()} {
    font-size: 14px;
  }
`

export const LinkedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  white-space: nowrap;
  justify-self: end;
  font-weight: 600;
  font-size: 14px;

  ${Media.upToSmall()} {
    gap: 4px;
    font-size: 12px;
  }
`

export const LinkedMetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  width: 100%;
  padding: 0 5px;
`

export const RewardsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const ValidStatusBadge = styled(LinkedBadge)`
  color: var(${UI.COLOR_SUCCESS});

  svg path {
    fill: var(${UI.COLOR_SUCCESS});
  }
`

export const LinkedCopy = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`

export const LinkedLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 10px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border-top: 1px solid var(${UI.COLOR_BORDER});

  > :first-child {
    flex: 1 1 auto;
    min-width: 0;
  }
`

export const LinkedLinkText = styled.span`
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  > strong {
    color: var(${UI.COLOR_TEXT});
    font-weight: inherit;
  }
`

export const LinkedActions = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
`

export const LinkedFooter = styled.div`
  margin-top: auto;
  padding: 18px 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const LinkedActionButton = styled(ButtonOutlined)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  height: 100%;
  min-width: 0;
  border-radius: 12px;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 14px;
`

export const LinkedActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`

export const LinkedFooterNote = styled(MetaRow)`
  justify-content: center;
  text-align: center;
`
