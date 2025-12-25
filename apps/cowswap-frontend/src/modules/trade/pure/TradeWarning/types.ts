import { ReactNode } from 'react'

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
