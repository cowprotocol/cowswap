import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { useHooks } from 'entities/orderHooks/useHooks'
import SVG from 'react-inlinesvg'

import { useAllHookDapps } from '../../hooks/useAllHookDapps'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  disabled?: boolean
  onOpen(): void
  onEditHook(uuid: string): void
  hideTooltip?: boolean
}

const isPreHook = false

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PostHookButton({ disabled = false, onOpen, onEditHook, hideTooltip }: PostHookButtonProps) {
  const { account } = useWalletInfo()
  const { postHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('postHooks')
  const dapps = useAllHookDapps(isPreHook)

  return (
    <>
      {postHooks.length > 0 && (
        <AppliedHookList
          disabled={disabled}
          dapps={dapps}
          account={account}
          hooks={postHooks}
          isPreHook={false}
          removeHook={removeHook}
          editHook={onEditHook}
          moveHook={moveHook}
        />
      )}
      <styledEl.Wrapper>
        <styledEl.AddHookButton disabled={disabled} onClick={disabled ? undefined : onOpen}>
          <SVG src={PLUS_ICON} /> <Trans>Add Post-Hook Action</Trans>{' '}
          {!hideTooltip && <HookTooltip isPreHook={false} />}
        </styledEl.AddHookButton>
      </styledEl.Wrapper>
    </>
  )
}
