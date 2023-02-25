import { Connector } from '@web3-react/types'


import { isMobile } from 'utils/userAgent'
import { getIsCoinbaseWallet, getIsInjected, getIsMetaMask } from '../../api/utils/connections'

import { CoinbaseWalletOption } from '../../web3-react/containers/ConnectWalletOptions/CoinbaseWalletOption'
import { FortmaticOption } from '../../web3-react/containers/ConnectWalletOptions/FortmaticOption'
import {
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
} from '../../web3-react/containers/ConnectWalletOptions/InjectedOption'
import { WalletConnectOption } from '../../web3-react/containers/ConnectWalletOptions/WalletConnectOption'

export type TryActivation = (connector: Connector) => void

export function ConnectWalletOptions({ tryActivation }: { tryActivation: TryActivation }) {
  const isInjected = getIsInjected()
  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()

  const isCoinbaseWalletBrowser = isMobile && isCoinbaseWallet
  const isMetaMaskBrowser = isMobile && isMetaMask
  const isInjectedMobileBrowser = isCoinbaseWalletBrowser || isMetaMaskBrowser

  let injectedOption
  if (!isInjected) {
    if (!isMobile) {
      injectedOption = <InstallMetaMaskOption />
    } else {
      injectedOption = <OpenMetaMaskMobileOption />
    }
  } else if (!isCoinbaseWallet) {
    if (isMetaMask) {
      injectedOption = <MetaMaskOption tryActivation={tryActivation} />
    } else {
      injectedOption = <InjectedOption tryActivation={tryActivation} />
    }
  }

  const coinbaseWalletOption = <CoinbaseWalletOption tryActivation={tryActivation} />

  const walletConnectionOption =
    (!isInjectedMobileBrowser && <WalletConnectOption tryActivation={tryActivation} />) ?? null

  const fortmaticOption = (!isInjectedMobileBrowser && <FortmaticOption tryActivation={tryActivation} />) ?? null

  return (
    <>
      {injectedOption}
      {walletConnectionOption}
      {coinbaseWalletOption}
      {fortmaticOption}
    </>
  )
}
