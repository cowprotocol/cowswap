import ICON_GRID from '@cowprotocol/assets/cow-swap/grid.svg'

import { Edit2, Trash2 } from 'react-feather'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { CowHookDetailsSerialized } from '../../types/hooks'

interface HookItemProp {
  hookDetails: CowHookDetailsSerialized
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  index: number
}

export function AppliedHookItem({ hookDetails, isPreHook, editHook, removeHook, index }: HookItemProp) {
  const { dapp } = hookDetails

  return (
    <styledEl.HookItemWrapper data-uid={hookDetails.uuid} as="li">
      <styledEl.HookItemHeader title={hookDetails.uuid}>
        <styledEl.HookItemInfo className="DragArea">
          <styledEl.DragIcon>
            <SVG src={ICON_GRID} />
          </styledEl.DragIcon>
          <styledEl.HookNumber>{index + 1}</styledEl.HookNumber>
          <img src={dapp.image} alt={dapp.name} />
          <span>{dapp.name}</span>
        </styledEl.HookItemInfo>
        <styledEl.HookItemActions>
          <styledEl.ActionBtn onClick={() => editHook(hookDetails.uuid)}>
            <Edit2 size={14} />
          </styledEl.ActionBtn>
          <styledEl.ActionBtn onClick={() => removeHook(hookDetails.uuid, isPreHook)} actionType="remove">
            <Trash2 size={14} />
          </styledEl.ActionBtn>
        </styledEl.HookItemActions>
      </styledEl.HookItemHeader>
    </styledEl.HookItemWrapper>
  )
}
