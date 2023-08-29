import { default as AlphaImage } from 'modules/wallet/api/assets/alpha.svg'
import { getIsAlphaWallet } from 'modules/wallet/api/utils/connection'

import { ConnectionType } from '../../api/types'
import { WalletConnectLabeledOption } from '../containers/WalletConnectLabeledOption'

import { TryActivation } from '.'

const alphaOption = {
  color: '#4196FC',
  icon: AlphaImage,
  id: 'alpha',
}

export function AlphaOption({ tryActivation }: { tryActivation: TryActivation }) {
  return (
    <WalletConnectLabeledOption
      options={alphaOption}
      checkWalletName={getIsAlphaWallet}
      tryActivation={tryActivation}
      connectionType={ConnectionType.ALPHA}
    />
  )
}
