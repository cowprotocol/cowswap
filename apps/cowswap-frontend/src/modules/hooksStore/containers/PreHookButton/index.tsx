import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { useAllHookDapps } from '../../hooks/useAllHookDapps'
import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'

export interface PreHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
  hideTooltip?: boolean
}

const isPreHook = true

export function PreHookButton({ onOpen, onEditHook, hideTooltip }: PreHookButtonProps) {
  const { account } = useWalletInfo()
  const { preHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('preHooks')
  const dapps = useAllHookDapps(isPreHook)

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
          <SVG src={PLUS_ICON} /> Add Pre-Hook Action {!hideTooltip && <HookTooltip isPreHook />}
        </styledEl.AddHookButton>
      </styledEl.Wrapper>
    </>
  )
}
