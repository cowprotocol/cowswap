import * as styledEl from './styled'

interface CancelledStepProps {
  children: React.ReactNode
}

export function CancelledStep({ children }: CancelledStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'cancelled'} flexFlow="column" margin={'14px auto 24px'}>
          Your order was cancelled
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.Description center margin="10px auto 40px">
        Your order was successfully cancelled.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}
