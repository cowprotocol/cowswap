import { default as WalletConnectImage } from '../../assets/walletConnectIcon.svg'
import { default as MetamaskImage } from '../../assets/metamask.png'
import { default as InjectedImage } from '../../assets/arrow-right.svg'
import { default as InjectedImageDark } from '../../assets/arrow-right.svg'
import { default as CoinbaseImage } from '../../assets/coinbase.svg'
import { default as FormaticImage } from '../../assets/formatic.png'

export const walletConnectOption = {
  color: '#4196FC',
  icon: WalletConnectImage,
  id: 'wallet-connect',
}

const metamaskCommonOption = {
  color: '#E8831D',
  icon: MetamaskImage,
  id: 'metamask',
}

export const metamaskInstallOption = {
  ...metamaskCommonOption,
  header: 'Install MetaMask',
  link: 'https://metamask.io/',
}

export const metamaskInjectedOption = {
  ...metamaskCommonOption,
  header: 'MetaMask',
}

const injectedCommon = {
  color: '#010101',
  id: 'injected',
}
export const injectedOption = {
  ...injectedCommon,
  icon: InjectedImage,
}

export const injectedOptionDark = {
  ...injectedCommon,
  icon: InjectedImageDark,
}

export const coinbaseInjectedOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet',
}

export const coinbaseMobileOption = {
  ...coinbaseInjectedOption,
  header: 'Open in Coinbase Wallet',
  link: 'https://go.cb-w.com/mtUDhEZPy1',
}

export const formaticOption = {
  color: '#6748FF',
  icon: FormaticImage,
  id: 'fortmatic',
}
