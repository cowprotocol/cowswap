import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { useHooks } from 'entities/orderHooks/useHooks'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { useAllHookDapps } from '../../hooks/useAllHookDapps'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'

export interface PreHookButtonProps {
  disabled?: boolean
  onOpen(): void
  onEditHook(uuid: string): void
  hideTooltip?: boolean
}

const isPreHook = true

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PreHookButton({ disabled = false, onOpen, onEditHook, hideTooltip }: PreHookButtonProps) {
  const { account } = useWalletInfo()
  const { preHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('preHooks')
  const dapps = useAllHookDapps(isPreHook)

  return (
    <>
      {preHooks.length > 0 && (
        <AppliedHookList
          disabled={disabled}
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
        <styledEl.AddHookButton disabled={disabled} onClick={disabled ? undefined : onOpen}>
          <SVG src={PLUS_ICON} /> <Trans>Add Pre-Hook Action</Trans> {!hideTooltip && <HookTooltip isPreHook />}
        </styledEl.AddHookButton>
      </styledEl.Wrapper>
    </>
  )
}
