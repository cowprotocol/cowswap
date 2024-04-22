import { useDisconnect as _useDisconnect } from '@web3modal/ethers5/react'

export function useDisconnect() {
  return _useDisconnect().disconnect
}
