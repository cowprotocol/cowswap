import { useSwitchNetwork as _useSwitchNetwork } from '@web3modal/ethers5/react'

export function useSwitchNetwork() {
  return _useSwitchNetwork().switchNetwork
}
