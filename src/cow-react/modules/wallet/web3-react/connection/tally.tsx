import { Connector } from '@web3-react/types'
import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { initializeConnector } from '@web3-react/core'
import { InjectedWallet } from '@cow/modules/wallet/web3-react/connectors/Injected'
import { Web3ReactConnection } from '../types'

import { default as TallyImage } from '@cow/modules/wallet/api/assets/tally.svg'

const WALLET_LINK = 'https://chrome.google.com/webstore/detail/taho/eajafomhmkipbjmfmhebemolkcicgfmd'
const BASE_PROPS = {
  color: '#4196FC',
  icon: TallyImage,
  id: 'tally',
}

const [tallyWallet, tallyWalletHooks] = initializeConnector<Connector>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: WALLET_LINK,
      searchKeywords: ['isTally', 'isTallyWallet', 'isTallyHo'],
    })
)
export const tallyWalletConnection: Web3ReactConnection = {
  connector: tallyWallet,
  hooks: tallyWalletHooks,
  type: ConnectionType.TALLY,
}

export function TallyWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(tallyWalletConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(tallyWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TALLY)}
    />
  )
}
