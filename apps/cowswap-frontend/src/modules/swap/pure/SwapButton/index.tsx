import { Command } from '@cowprotocol/types'
import { ButtonSize, ButtonError } from '@cowprotocol/ui'

export interface SwapButtonProps {
  disabled: boolean
  onClick: Command
  children?: React.ReactNode
}

export function SwapButton(props: SwapButtonProps) {
  const { disabled, onClick, children } = props

  return (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={onClick} width="100%" id="swap-button" disabled={disabled}>
      {children}
    </ButtonError>
  )
}
