import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { POST_HOOK_REGISTRY } from '../../hookRegistry'
import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookList } from '../../pure/AppliedHookList'
import { HookTooltip } from '../../pure/HookTooltip'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
}

const isPreHook = false

export function PostHookButton({ onOpen, onEditHook }: PostHookButtonProps) {
  const { account, chainId } = useWalletInfo()
  const { postHooks } = useHooks()
  const removeHook = useRemoveHook(isPreHook)
  const moveHook = useReorderHooks('postHooks')
  const dapps = POST_HOOK_REGISTRY[chainId]

  return (
    <>
      {postHooks.length > 0 && (
        <AppliedHookList
          dapps={dapps}
          account={account}
          hooks={postHooks}
          isPreHook={false} // Indicate that these are post-hooks
          removeHook={removeHook}
          editHook={onEditHook}
          moveHook={moveHook}
        />
      )}
      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Post-Hook Action <HookTooltip isPreHook={false} />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
    </>
  )
}
