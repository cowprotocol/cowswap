import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useEffect, useState, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { injected, walletconnect, getProviderType, WalletProvider } from 'connectors'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

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

  const connectWalletConnect = useCallback(() => {
    activate(walletconnect, undefined, true).catch(() => {
      setTried(true)
    })
  }, [activate, setTried])

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
        connectWalletConnect()
      }
    }
  }, [connectInjected, connectWalletConnect, active]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  useEffect(() => {
    if (connector) {
      // check if current connector is of type WalletConnect
      if (connector instanceof WalletConnectConnector) {
        const walletConnect = connector.walletConnectProvider.signer.connection.wc

        // listen on disconnect events directly on WalletConnect client and close connection
        // important if the connection is closed from the wallet side after page refresh
        walletConnect.on('disconnect', (error: any) => {
          connector.close()
          localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)

          if (error) {
            throw error
          }
        })
      }
    }
  }, [connector])

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
