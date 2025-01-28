import { Command } from '@cowprotocol/types'
import { useDisconnect } from '@reown/appkit/react'

const { disconnect } = useDisconnect()

export function useDisconnectWallet(onDisconnect?: Command) {
  return () => {
    disconnect().then(onDisconnect)
  }
}
