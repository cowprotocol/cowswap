import { AlertTriangle } from 'react-feather'
import { InfoIcon } from 'legacy/components/InfoIcon'
import React, { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

export enum TradeWarningType {
  LOW,
  MEDIUM,
  HIGH,
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

const warningColorMap: { [key in TradeWarningType]: string } = {
  [TradeWarningType.LOW]: '#FFEDAF',
  [TradeWarningType.MEDIUM]: '#FFC7AF',
  [TradeWarningType.HIGH]: '#FF7676',
}

const WarningBox = styled.div<{ color: string }>`
  border-radius: 7px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  background: ${({ color }) => color};
  color: ${({ theme }) => theme.black};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 99%;

  svg {
    stroke: ${({ theme }) => theme.black}!important;
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

const StyledInfoIcon = styled(InfoIcon)`
  opacity: 0.5;
`

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
  const color = warningColorMap[type]

  return (
    <WarningBox color={color} className={className}>
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
