import { ButtonSize } from 'theme'
import { ButtonError } from 'components/Button'

export interface ErrorButtonProps {
  disabled: boolean
  onClick: () => void
  children?: React.ReactNode
}

// TODO: should be refactored (need to separate context/logic/view)
export function ErrorButton(props: ErrorButtonProps) {
  const { disabled, onClick, children } = props

  return (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={onClick} width="100%" id="swap-button" disabled={disabled}>
      {children}
    </ButtonError>
  )
}
