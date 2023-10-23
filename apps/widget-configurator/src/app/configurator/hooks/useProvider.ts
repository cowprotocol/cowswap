import { useEffect, useState } from 'react'

import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useAccount, useConfig } from 'wagmi'

import EventEmitter from 'events'

const onDisconnect = new EventEmitter()

export function useProvider(): EthereumProvider | null {
  const config = useConfig()
  const { isDisconnected } = useAccount()
  const [provider, setProvider] = useState<EthereumProvider | null>(null)

  useEffect(() => {
    return config.subscribe(({ connector }) => {
      connector?.getProvider().then((provider) => {
        setProvider(getEthereumProvider(provider, onDisconnect))
      })
    })
  }, [config])

  useEffect(() => {
    if (!provider || !isDisconnected) return

    onDisconnect.emit('disconnect')
  }, [provider, isDisconnected])

  return provider
}

function getEthereumProvider(provider: EthereumProvider, onDisconnect: EventEmitter): EthereumProvider {
  return {
    request(...args) {
      return provider.request(...args)
    },
    enable(...args) {
      return provider.enable(...args)
    },
    on(event: string, args: unknown) {
      if (event === 'disconnect' || event === 'close') {
        return onDisconnect.on('disconnect', args)
      } else {
        return provider.on(event, args)
      }
    },
  }
}
