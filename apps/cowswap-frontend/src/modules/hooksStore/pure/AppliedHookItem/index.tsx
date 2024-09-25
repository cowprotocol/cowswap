import ICON_GRID from '@cowprotocol/assets/cow-swap/grid.svg'
import TenderlyLogo from '@cowprotocol/assets/cow-swap/tenderly-logo.svg'
import { InfoTooltip } from '@cowprotocol/ui'

import { Edit2, Trash2 } from 'react-feather'
import SVG from 'react-inlinesvg'

import { TenderlySimulate } from 'modules/hooksStore/containers/TenderlySimulate'

import * as styledEl from './styled'

import { CowHookDetailsSerialized } from '../../types/hooks'

interface HookItemProp {
  account?: string
  hookDetails: CowHookDetailsSerialized
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  index: number
}

export function AppliedHookItem({ account, hookDetails, isPreHook, editHook, removeHook, index }: HookItemProp) {
  const { hook, dapp } = hookDetails

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
