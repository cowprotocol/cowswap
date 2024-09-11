import omniLogo from './omnilogo.png'

import { HookDappInternal, HookDappType } from '../../types/hooks'

import { OmnibridgeApp } from './index'

export const POST_OMNIBRIDGE_HOOK: HookDappInternal = {
  name: 'Omnibridge',
  description: 'Bridge from Gnosis Chain to Mainnet',
  type: HookDappType.INTERNAL,
  component: (props) => <OmnibridgeApp {...props} />,
  image: omniLogo,
  version: 'v0.0.1',
}
