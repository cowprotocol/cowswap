import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { useAllHookDapps } from '../../hooks/useAllHookDapps'
import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
  hideTooltip?: boolean
}

const isPreHook = false

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PostHookButton({ onOpen, onEditHook, hideTooltip }: PostHookButtonProps) {
  const { account } = useWalletInfo()
  const { postHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('postHooks')
  const dapps = useAllHookDapps(isPreHook)

  return (
    <>
      {postHooks.length > 0 && (
        <AppliedHookList
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
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Post-Hook Action {!hideTooltip && <HookTooltip isPreHook={false} />}
        </styledEl.AddHookButton>
      </styledEl.Wrapper>
    </>
  )
}
