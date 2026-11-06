import { AlertCircle, Info } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'
import { NewTooltip } from '../Tooltip/Tooltip'

const ICON_SIZE_PX = 14

const iconStyles = css`
  width: ${ICON_SIZE_PX}px;
  height: ${ICON_SIZE_PX}px;
  color: inherit;
  opacity: 0.7;
  line-height: 0;
  vertical-align: middle;
  flex-shrink: 0;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const hitTargetStyles = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: help;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
  }
`

export const InfoIcon = styled(Info)`
  ${iconStyles}
`

export const AlertIcon = styled(AlertCircle)`
  ${iconStyles}
`

export const HelpIcon = styled(SVG)`
  ${iconStyles}

  > path {
    stroke: currentColor;
  }
`

export const InstantTooltip = styled(NewTooltip).attrs({
  disableHoverablePopup: true,
  closeDelay: 0,
})`
  ${hitTargetStyles}
`

export const TriggerButton = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  ${hitTargetStyles}
`
