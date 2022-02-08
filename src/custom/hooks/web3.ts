import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { useEffect, useState, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { injected, walletconnect, getProviderType, WalletProvider, portis } from 'connectors'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'

// exports from the original file
export { useActiveWeb3React, useInactiveListener } from '@src/hooks/web3'

export function useEagerConnect() {
  const { activate, active, connector } = useWeb3ReactCore()
  const [tried, setTried] = useState(false)

  // handle setting/removing wallet provider in local storage
  const handleBeforeUnload = useCallback(() => {
    const walletType = getProviderType(connector)

    if (!walletType || !active) {
      localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, walletType)
    }
  }, [connector, active])

  const connectInjected = useCallback(() => {
    // check if the our application is authorized/connected with Metamask
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate, setTried])

  const reconnectUninjectedProvider = useCallback(
    (provider: AbstractConnector): void => {
      activate(provider, undefined, true).catch(() => {
        setTried(true)
      })
    },
    [activate, setTried]
  )

  useEffect(() => {
    if (!active) {
      const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

      // if there is no last saved provider set tried state to true
      if (!latestProvider) {
        // Try to auto-connect to the injected wallet
        connectInjected()
      } else if (latestProvider === WalletProvider.INJECTED) {
        // MM is last provider
        connectInjected()
      } else if (latestProvider === WalletProvider.WALLET_CONNECT) {
        // WC is last provider
        reconnectUninjectedProvider(walletconnect)
      } else if (latestProvider === WalletProvider.PORTIS) {
        // WC is last provider
        reconnectUninjectedProvider(portis)
      }
    }
  }, [connectInjected, active, reconnectUninjectedProvider]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  useEffect(() => {
    // add beforeunload event listener on initial component mount
    window.addEventListener('beforeunload', handleBeforeUnload)

    // remove beforeunload event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  return tried
}
