import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { default as TallyImage } from 'modules/wallet/api/assets/tally.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'
import { InjectedWallet } from 'modules/wallet/web3-react/connectors/Injected'

import { Web3ReactConnection } from '../types'

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
