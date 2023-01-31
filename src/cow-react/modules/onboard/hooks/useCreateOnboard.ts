import { init } from '@web3-onboard/react'

import { accountCenter } from '../constants/accountCenter'
import { mainet, polygon, gnosisChain, goerli } from '../constants/chains'
import { appMetadata } from '../constants/wallets'
import { getWalletsByChain } from '../utils/getWalletsByChain'

export const useCreateOnboard = () => {
  const chains = [mainet, polygon, gnosisChain, goerli]

  const wallets = getWalletsByChain()

  const web3Onboard = init({
    wallets,
    chains,
    appMetadata,
    accountCenter,
  })

  return web3Onboard
}
