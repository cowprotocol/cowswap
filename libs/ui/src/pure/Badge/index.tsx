import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { BadgeType } from '../../types'

const badgeBackgrounds: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFO_BG})`,
  alert: `var(${UI.COLOR_ALERT_BG})`,
  alert2: `var(${UI.COLOR_BADGE_YELLOW_BG})`,
  success: `var(${UI.COLOR_SUCCESS_BG})`,
  default: 'transparent',
}

const badgeColors: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFO_TEXT})`,
  alert: `var(${UI.COLOR_ALERT_TEXT})`,
  alert2: `var(${UI.COLOR_BADGE_YELLOW_TEXT})`,
  success: `var(${UI.COLOR_SUCCESS_TEXT})`,
  default: `var(${UI.COLOR_DISABLED_TEXT})`,
}

export const Badge = styled.div<{ type?: BadgeType }>`
  background: ${({ type }) => badgeBackgrounds[type || 'default']};
  color: ${({ type }) => badgeColors[type || 'default']};
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  font-size: 10px;
  font-weight: inherit;
  text-transform: uppercase;
  padding: ${({ type }) => (!type || type === 'default' ? '0' : '4px 6px')};
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0;

  svg {
    width: 10px;
    height: 10px;
    color: ${({ type }) => badgeColors[type || 'default']};
  }

  svg > path {
    fill: ${({ type }) => badgeColors[type || 'default']};
  }
`
