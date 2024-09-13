import ICON_GRID from '@cowprotocol/assets/cow-swap/grid.svg'
import TenderlyLogo from '@cowprotocol/assets/cow-swap/tenderly-logo.svg'
import { InfoTooltip } from '@cowprotocol/ui'

import { Edit2, Trash2 } from 'react-feather'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'
import { useDragAndDrop } from './useDragAndDrop'

import { TenderlySimulate } from '../../containers/TenderlySimulate'
import { CowHookDetailsSerialized } from '../../types/hooks'

interface HookItemProp {
  account: string | undefined
  hookDetails: CowHookDetailsSerialized
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  index: number
  moveHook: (dragIndex: number, hoverIndex: number) => void
}

export function AppliedHookItem({
  account,
  hookDetails,
  isPreHook,
  editHook,
  removeHook,
  index,
  moveHook,
}: HookItemProp) {
  const { hook, dapp } = hookDetails
  const { ref, isDragging, isOver, draggedItem } = useDragAndDrop(index, hookDetails.uuid, moveHook)

  const isHoveringOverDifferentItem = isOver && draggedItem && draggedItem.index !== index

  return (
    <styledEl.HookItemWrapper
      data-uid={hookDetails.uuid}
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
    >
      {isHoveringOverDifferentItem && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px dashed #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            backdropFilter: 'blur(2px)',
            pointerEvents: 'none',
            borderRadius: '16px',
            fontSize: '24px',
            fontWeight: 500,
          }}
        >
          Release to drop hook
        </div>
      )}
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
