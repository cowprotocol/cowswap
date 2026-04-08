import { ReactNode } from 'react'

import { TradeFormButtonContext } from '../../types'

export type ButtonComponent = React.ComponentType<ButtonComponentProps>

export type ButtonComponentProps = TradeFormButtonContext & { isDisabled?: boolean }

export interface ButtonErrorConfig {
  text: ReactNode
  id?: string
}
