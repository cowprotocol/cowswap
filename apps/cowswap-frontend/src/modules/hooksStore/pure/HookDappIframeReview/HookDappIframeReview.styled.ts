import { ButtonEmpty, CopyButton, ExternalLink, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { InfoTable } from '../HookInfoTable/HookInfoTable.styled'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

export const CopyBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const Title = styled.h3`
  margin: 0;
`

export const Description = styled.p`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const WarningBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_ALERT_BG});
  color: var(${UI.COLOR_ALERT_TEXT});

  > span {
    font-size: 14px;
  }
`

export const DetailsTable = styled(InfoTable)`
  td:first-child {
    width: 150px;
    font-size: var(${UI.FONT_SIZE_NORMAL});
  }
`

const valueStyles = css`
  color: var(${UI.COLOR_TEXT});
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  font-size: var(${UI.FONT_SIZE_NORMAL});
  font-weight: inherit;
  white-space: normal;
  overflow-wrap: anywhere;
`

export const Value = styled.span`
  ${valueStyles}
`

export const ExternalValueLink = styled(ExternalLink)`
  ${valueStyles}

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`

export const LabelWithAction = styled.span`
  && {
    display: flex;
    align-items: center;
    gap: 3px;
    vertical-align: initial;
  }
`

export const CopyCalldataButton = styled(CopyButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 0;
  line-height: 0;

  &:hover,
  &:focus {
    color: var(${UI.COLOR_TEXT});
    text-decoration: none;
  }
`

export const CallDataValue = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  font-size: var(${UI.FONT_SIZE_NORMAL});
  max-height: 8lh;
  overflow-y: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const CancelButton = styled(ButtonEmpty)`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 18px;
  font-weight: 600;
  min-height: 58px;
  padding: 6px 8px;

  &:focus,
  &:hover,
  &:active {
    color: var(${UI.COLOR_TEXT});
    text-decoration: none;
  }
`
