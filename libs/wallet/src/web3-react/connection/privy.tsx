import { RPC_URLS } from '@cowprotocol/common-const'
import { ButtonPrimary } from '@cowprotocol/ui'
import { initializeConnector } from '@web3-react/core'

import { useLogin, usePrivy } from '@privy-io/react-auth'

import { onError } from './onError'

import { ConnectionType } from '../../api/types'
import { MetaMaskSDK } from '../connectors/metaMaskSdk'
import { PrivyConnector } from '../connectors/PrivyConnector'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const [web3MetaMask, web3MetaMaskHooks] = initializeConnector<MetaMaskSDK>(
  (actions) =>
    new MetaMaskSDK({
      actions,
      options: {
        dappMetadata: {
          name: 'CoW Swap',
          url: 'https://swap.cow.fi',
        },
        readonlyRPCMap: Object.fromEntries(
          Object.entries(RPC_URLS).map(([chainId, url]) => [`0x${Number(chainId).toString(16)}`, url]),
        ),
      },
      onError,
    }),
)

export const privyConnection: Web3ReactConnection<MetaMaskSDK> = {
  connector: web3MetaMask,
  hooks: web3MetaMaskHooks,
  type: ConnectionType.PRIVY,
}

function getPrivyConnector() {
  const [privy, privyHook] = initializeConnector<PrivyConnector>((actions) => new PrivyConnector(actions))

  return {
    connector: privy,
    hooks: privyHook,
    type: ConnectionType.PRIVY,
  }
}

export function PrivyOption({ tryActivation }: ConnectionOptionProps) {
  const { authenticated, user } = usePrivy()

  console.log('privy ready ===>', authenticated, user)

  const { login } = useLogin({
    onComplete: () => {
      console.log('login success ===>')
      tryActivation(getPrivyConnector().connector)
    },
    onError: () => {
      console.log('login error ===>')
    },
  })

  return (
    <ButtonPrimary disabled={authenticated} onClick={login}>
      Email or social
    </ButtonPrimary>
  )
}
