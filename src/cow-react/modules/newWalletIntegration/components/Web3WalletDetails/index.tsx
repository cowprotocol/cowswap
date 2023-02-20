import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { LedgerConnector } from 'wagmi/connectors/ledger'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { mainnet, gnosis, goerli } from 'wagmi/chains'
import { Connector } from 'wagmi'
import { Buffer } from 'buffer'

// polyfill Buffer for client
if (!window.Buffer) {
  window.Buffer = Buffer
}

const injected = new InjectedConnector({
  chains: [mainnet, gnosis, goerli],
})

const coinbase = new CoinbaseWalletConnector({
  chains: [mainnet, gnosis, goerli],
  options: {
    appName: 'wagmi.sh',
    jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/yourAlchemyId',
  },
})

const ledger = new LedgerConnector({
  chains: [mainnet, gnosis, goerli],
})

const walletConnect = new WalletConnectConnector({
  options: {
    qrcode: true,
  },
})

type ConnectType = {
  connector: Connector
  name: string
}

const Connect = ({ connector, name }: ConnectType) => {
  const { connect } = useConnect({ connector })
  const { disconnect } = useDisconnect()
  const { address, isConnecting, connector: currentConnector } = useAccount()

  const isConnected = currentConnector && connector.id === currentConnector.id && address

  return (
    <button disabled={isConnecting} onClick={() => (isConnected ? disconnect() : connect())}>
      {isConnecting ? 'connecting' : isConnected ? 'disconnect' : `Connect with ${name}`}
    </button>
  )
}

export const WalletDetails = () => {
  return (
    <div>
      <Connect connector={injected} name={'Injected'} />
      <Connect connector={coinbase} name={'Coinbase'} />
      <Connect connector={ledger} name={'Ledger'} />
      <Connect connector={walletConnect} name={'WalletConnect'} />
    </div>
  )
}
