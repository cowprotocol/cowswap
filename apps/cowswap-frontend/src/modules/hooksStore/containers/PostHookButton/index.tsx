import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { POST_HOOK_REGISTRY } from '../../hookRegistry'
import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookItem } from '../../pure/AppliedHookItem'
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
      {postHooks && (
        <styledEl.HookList>
          {postHooks.map((hook, index) => (
            <AppliedHookItem
              key={hook.hookDetails.uuid}
              dapp={dapps.find((dapp) => dapp.name === hook.dappName)!}
              account={account}
              hookDetails={hook}
              removeHook={removeHook}
              editHook={onEditHook}
              isPreHook={isPreHook}
              index={index}
              moveHook={moveHook}
            />
          ))}
        </styledEl.HookList>
      )}
      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Post-Hook Action <HookTooltip isPreHook={false} />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
    </>
  )
}
