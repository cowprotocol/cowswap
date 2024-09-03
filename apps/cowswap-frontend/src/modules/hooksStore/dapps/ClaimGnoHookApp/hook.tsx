import gnoLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'

import { ClaimGnoHookApp } from './index'

export const PRE_CLAIM_GNO: HookDappInternal = {
  name: 'Claim GNO from validators',
  description: 'Allows you to withdraw the rewards from your Gnosis validators.',
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/claim-gno',
  component: (dapp) => <ClaimGnoHookApp dapp={dapp} />,
  image: gnoLogo,
  version: 'v0.1.1',
}
