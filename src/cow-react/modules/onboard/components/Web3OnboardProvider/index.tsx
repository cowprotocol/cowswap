import { ReactNode } from 'react'
import { Web3OnboardProvider as Provider } from '@web3-onboard/react'
import { useCreateOnboard } from '../../hooks/useCreateOnboard'

export function Web3OnboardProvider({ children }: { children: ReactNode }) {
  return <Provider web3Onboard={useCreateOnboard()}>{children}</Provider>
}
