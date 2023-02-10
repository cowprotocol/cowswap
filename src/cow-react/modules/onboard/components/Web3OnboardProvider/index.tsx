import { ReactNode } from 'react'
import { Web3OnboardProvider as Provider } from '@web3-onboard/react'
import { useCreateOnboard } from '../../hooks/useCreateOnboard'

export function Web3OnboardProvider({ children }: { children: ReactNode }) {
  const oboard = useCreateOnboard()

  return oboard ? <Provider web3Onboard={oboard}>{children}</Provider> : null
}
