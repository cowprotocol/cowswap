import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDrop } from 'react-dnd'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { useReorderHooks } from '../../hooks/useReorderHooks'
import { AppliedHookItem } from '../../pure/AppliedHookItem'
import { HookTooltip } from '../../pure/HookTooltip'

const ItemTypes = {
  HOOK: 'hook',
}

export interface PreHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
}

export function PreHookButton({ onOpen, onEditHook }: PreHookButtonProps) {
  const { account } = useWalletInfo()
  const { preHooks } = useHooks()
  const removeHook = useRemoveHook()
  const moveHook = useReorderHooks('preHooks')

  const [, drop] = useDrop(() => ({ accept: ItemTypes.HOOK }))

  return (
    <div ref={drop}>
      {preHooks.length > 0 && (
        <styledEl.HookList>
          {preHooks.map((hookDetails, index) => (
            <AppliedHookItem
              key={hookDetails.uuid}
              index={index}
              account={account}
              hookDetails={hookDetails}
              removeHook={removeHook}
              editHook={onEditHook}
              moveHook={moveHook}
              isPreHook
            />
          ))}
        </styledEl.HookList>
      )}

      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Pre-Hook Action <HookTooltip isPreHook />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
    </div>
  )
}
