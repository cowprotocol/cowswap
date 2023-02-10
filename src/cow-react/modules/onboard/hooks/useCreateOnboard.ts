import { init } from '@web3-onboard/react'

import { accountCenter } from '../constants/accountCenter'
import { mainet, polygon, gnosisChain, goerli } from '../constants/chains'
import { appMetadata } from '../constants/wallets'
import { getWalletsByChain } from '../utils/getWalletsByChain'
import { useEffect, useState } from 'react'
import type { OnboardAPI } from '@web3-onboard/core'

export const useCreateOnboard = () => {
  const [web3Onboard, setWeb3Onboard] = useState<OnboardAPI | null>(null)
  const chains = [mainet, polygon, gnosisChain, goerli]

  useEffect(() => {
    Promise.all(getWalletsByChain()).then(wallets => {
      setWeb3Onboard(
        init({
          wallets,
          chains,
          appMetadata,
          accountCenter,
        })
      )
    })
  }, [])

  return web3Onboard
}
