import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'

export interface PreHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
}

const isPreHook = true

export function PreHookButton({ onOpen, onEditHook }: PreHookButtonProps) {
  const { account, chainId } = useWalletInfo()
  const { preHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('preHooks')
  const dapps = PRE_HOOK_REGISTRY[chainId]

  return (
    <>
      {preHooks.length > 0 && (
        <AppliedHookList
          dapps={dapps}
          account={account}
          hooks={preHooks}
          isPreHook={true}
          removeHook={removeHook}
          editHook={onEditHook}
          moveHook={moveHook}
        />
      )}

      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Pre-Hook Action <HookTooltip isPreHook />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
    </>
  )
}
