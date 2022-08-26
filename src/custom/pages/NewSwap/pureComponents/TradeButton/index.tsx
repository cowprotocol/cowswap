import { ButtonPrimary } from 'components/Button'
import { ReactNode } from 'react'

// TODO: implement Trade form state
export function TradeButton({ children }: { children: ReactNode }) {
  return <ButtonPrimary>{children}</ButtonPrimary>
}
