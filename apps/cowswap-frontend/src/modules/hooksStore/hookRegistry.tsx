import { hookDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { AirdropHookApp } from './dapps/AirdropHookApp'
import { BuildHookApp } from './dapps/BuildHookApp'
import { ClaimGnoHookApp } from './dapps/ClaimGnoHookApp'
import { PermitHookApp } from './dapps/PermitHookApp'
import { HookDapp } from './types/hooks'

export const ALL_HOOK_DAPPS = [
  {
    ...hookDappsRegistry.BUILD_CUSTOM_HOOK,
    id: 'BUILD_CUSTOM_HOOK',
    component: (props) => <BuildHookApp {...props} />,
  },
  {
    ...hookDappsRegistry.CLAIM_GNO_FROM_VALIDATORS,
    id: 'CLAIM_GNO_FROM_VALIDATORS',
    component: (props) => <ClaimGnoHookApp {...props} />,
  },
  {
    ...hookDappsRegistry.PERMIT_TOKEN,
    id: 'PERMIT_TOKEN',
    component: (props) => <PermitHookApp {...props} />,
  },
  {
    ...hookDappsRegistry.CLAIM_COW_AIRDROP,
    id: 'CLAIM_COW_AIRDROP',
    component: (props) => <AirdropHookApp {...props} />,
  },
] as HookDapp[]
