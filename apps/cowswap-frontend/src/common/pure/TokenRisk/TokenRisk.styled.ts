import { TokenWarningTier } from '@cowprotocol/tokens'
import { font, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

const tierColor = (tier: TokenWarningTier): string =>
  tier === 'serious' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_ALERT_TEXT})`

const tierBackground = (tier: TokenWarningTier): string =>
  tier === 'serious' ? `var(${UI.COLOR_DANGER_BG})` : `var(${UI.COLOR_ALERT_BG})`

export const QuietRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

export const QuietLine = styled.button<{ tier: TokenWarningTier }>`
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 8px 0 8px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: ${({ tier }) => tierColor(tier)};
  ${font('FONT_SMALL_PLUS', 'medium')}

  > svg {
    flex-shrink: 0;
  }

  &:hover {
    text-decoration: underline;
  }

  &:active {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`

export const SectionTitle = styled.h3`
  margin: 0;
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_NORMAL', 'semibold')}
`

export const RiskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`

export const TierLabel = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  ${font('FONT_SMALL', 'medium')}
`

export const RiskRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`

export const IconWell = styled.div<{ tier: TokenWarningTier }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: ${({ tier }) => tierBackground(tier)};
  color: ${({ tier }) => tierColor(tier)};
`

export const RiskCopy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-top: 1px;
`

export const RiskTitle = styled.span`
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_NORMAL', 'semibold')}
`

export const RiskDescription = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  ${font('FONT_SMALL_PLUS')}
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
`

export const AboutHeading = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
`

export const AboutAddress = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  word-break: break-all;
  ${font('FONT_SMALL')}
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

export const FooterNote = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  ${font('FONT_SMALL_PLUS')}
`

export const FooterSource = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  ${font('FONT_SMALL')}
`

const checkboxSide = css`
  width: 18px;
  height: 18px;
`

export const Acknowledgement = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  padding: 4px 2px;
  border-radius: 12px;
  cursor: pointer;
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_NORMAL')}

  > input {
    ${checkboxSide}
    flex-shrink: 0;
    margin: 1px 0 0;
    accent-color: var(${UI.COLOR_PRIMARY});
    cursor: pointer;
  }

  > input:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`
