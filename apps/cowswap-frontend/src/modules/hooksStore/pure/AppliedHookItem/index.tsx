import { useRef } from 'react'

import ICON_GRID from '@cowprotocol/assets/cow-swap/grid.svg'
import TenderlyLogo from '@cowprotocol/assets/cow-swap/tenderly-logo.svg'
import { CowHookDetailsSerialized } from '@cowprotocol/types'
import { InfoTooltip } from '@cowprotocol/ui'

import { useDrag, useDrop } from 'react-dnd'
import { Edit2, Trash2 } from 'react-feather'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { TenderlySimulate } from '../../containers/TenderlySimulate'

const ItemTypes = {
  HOOK: 'hook',
}

interface HookItemProp {
  account: string | undefined
  hookDetails: CowHookDetailsSerialized
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  index: number
  moveHook: (dragIndex: number, hoverIndex: number) => void
}

export function AppliedHookItem({ account, hookDetails, isPreHook, editHook, removeHook, index, moveHook }: HookItemProp) {
  const { hook, dapp } = hookDetails
  const ref = useRef<HTMLLIElement>(null)

  const [, drop] = useDrop({
    accept: ItemTypes.HOOK,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverThresholdY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 6
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverThresholdY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverThresholdY * 5) {
        return
      }

      moveHook(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.HOOK,
    item: () => {
      return { id: hookDetails.uuid, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return (
    <styledEl.HookItemWrapper data-uid={hookDetails.uuid} ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <styledEl.HookItemHeader title={hookDetails.uuid}>
        <styledEl.HookItemInfo>
          <styledEl.DragIcon>
            <SVG src={ICON_GRID} />
          </styledEl.DragIcon>
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

      {account && (
        <styledEl.SimulateContainer>
          <div>
            <styledEl.SimulateHeader>
              <strong>Run a simulation</strong>
              <InfoTooltip content="This transaction can be simulated before execution to ensure that it will succeed, generating a detailed report of the transaction execution." />
            </styledEl.SimulateHeader>
            <styledEl.SimulateFooter>
              <span>Powered by</span>
              <SVG src={TenderlyLogo} description="Tenderly" />
            </styledEl.SimulateFooter>
          </div>
          <div>
            <TenderlySimulate hook={hook} />
          </div>
        </styledEl.SimulateContainer>
      )}
    </styledEl.HookItemWrapper>
  )
}
