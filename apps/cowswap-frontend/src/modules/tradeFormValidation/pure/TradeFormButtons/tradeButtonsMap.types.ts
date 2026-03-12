import { ReactNode } from 'react'

import { TradeFormButtonContext } from '../../types'

export interface ButtonErrorConfig {
  text: ReactNode
  id?: string
}

export type ButtonComponentProps = TradeFormButtonContext & { isDisabled?: boolean }

export type ButtonComponent = React.ComponentType<ButtonComponentProps>
