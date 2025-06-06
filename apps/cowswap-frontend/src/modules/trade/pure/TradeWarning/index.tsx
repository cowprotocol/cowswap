import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'
import { InfoTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'


export enum TradeWarningType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface TradeWarningProps {
  text: ReactNode
  tooltipContent: ReactNode
  acceptLabel?: ReactNode
  isAccepted?: boolean
  type?: TradeWarningType
  withoutAccepting?: boolean
  className?: string
  acceptCallback?: (isAccepted: boolean) => void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getWarningBoxStyles = (type: TradeWarningType) => {
  switch (type) {
    case TradeWarningType.LOW:
      return {
        background: `var(${UI.COLOR_ALERT_BG})`,
        color: `var(${UI.COLOR_ALERT_TEXT})`,
      }
    case TradeWarningType.MEDIUM:
      return {
        background: `var(${UI.COLOR_WARNING_BG})`,
        color: `var(${UI.COLOR_WARNING_TEXT})`,
      }
    // return DANGER by default
    default:
      return {
        background: `var(${UI.COLOR_DANGER_BG})`,
        color: `var(${UI.COLOR_DANGER_TEXT})`,
      }
  }
}

const WarningBox = styled.div<{ color: TradeWarningType }>`
  ${({ color }) => {
    const { background, color: textColor } = getWarningBoxStyles(color)
    return `
      background: ${background};
      color: ${textColor};
    `
  }}
  border-radius: 7px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 99%;

  svg {
    stroke: currentColor;
  }
`

const InfoBox = styled.div<{ withoutAccepting: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: ${({ withoutAccepting }) => (withoutAccepting ? '0px' : '10px')};
  width: ${({ withoutAccepting }) => (withoutAccepting ? '100%' : '')};
  justify-content: ${({ withoutAccepting }) => (withoutAccepting ? 'space-around' : '')};
`

const AcceptBox = styled.label`
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`

const AlertIcon = styled(AlertTriangle)`
  margin-right: 5px;
`

const StyledInfoIcon = styled(InfoTooltip)`
  opacity: 0.5;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeWarning(props: TradeWarningProps) {
  const {
    type = TradeWarningType.LOW,
    acceptLabel = 'Swap anyway',
    text,
    tooltipContent,
    withoutAccepting,
    acceptCallback,
    isAccepted,
    className,
  } = props

  return (
    <WarningBox color={type} className={className}>
      <InfoBox withoutAccepting={!!withoutAccepting}>
        <AlertIcon size={18} />
        <span>{text}</span>
        <StyledInfoIcon content={tooltipContent} />
      </InfoBox>
      {!withoutAccepting && (
        <div>
          <AcceptBox>
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(event) => {
                acceptCallback?.(event.target.checked)
              }}
            />
            <span>
              <Trans>{acceptLabel}</Trans>
            </span>
          </AcceptBox>
        </div>
      )}
    </WarningBox>
  )
}
