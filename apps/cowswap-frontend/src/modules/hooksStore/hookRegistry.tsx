import { HookDappBase, hookDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { AirdropHookApp } from './dapps/AirdropHookApp'
import { BuildHookApp } from './dapps/BuildHookApp'
import { ClaimGnoHookApp } from './dapps/ClaimGnoHookApp'
import { PermitHookApp } from './dapps/PermitHookApp'
import { HookDapp, HookDappInternal } from './types/hooks'

const HOOK_DAPPS_OVERRIDES: Record<string, Partial<HookDappInternal>> = {
  BUILD_CUSTOM_HOOK: { component: (props) => <BuildHookApp {...props} /> },
  CLAIM_GNO_FROM_VALIDATORS: { component: (props) => <ClaimGnoHookApp {...props} /> },
  PERMIT_TOKEN: { component: (props) => <PermitHookApp {...props} /> },
  CLAIM_COW_AIRDROP: { component: (props) => <AirdropHookApp {...props} /> },
}

export const ALL_HOOK_DAPPS = Object.keys(hookDappsRegistry).map((id) => {
  const item = (hookDappsRegistry as Record<string, Omit<HookDappBase, 'id'>>)[id]

  return {
    ...item,
    ...HOOK_DAPPS_OVERRIDES[id],
    id,
  }
}) as HookDapp[]
