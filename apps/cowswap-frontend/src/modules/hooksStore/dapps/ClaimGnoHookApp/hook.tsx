import gnoLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'

import { HookDappInternal, HookDappType } from '../../types/hooks'

import { ClaimGnoHookApp } from './index'

export const PRE_CLAIM_GNO: HookDappInternal = {
  name: 'Claim GNO from validators',
  description: 'Allows you to withdraw the rewards from your Gnosis validators.',
  type: HookDappType.INTERNAL,
  component: (props) => <ClaimGnoHookApp {...props} />,
  image: gnoLogo,
  version: 'v0.1.1',
}
