import ICON_CHECK_ICON from '@cowprotocol/assets/cow-swap/check-singular.svg'
import ICON_GRID from '@cowprotocol/assets/cow-swap/grid.svg'
import TenderlyLogo from '@cowprotocol/assets/cow-swap/tenderly-logo.svg'
import ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { InfoTooltip } from '@cowprotocol/ui'

import { Edit2, Trash2, ExternalLink as ExternalLinkIcon } from 'react-feather'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { TenderlySimulate } from '../../containers/TenderlySimulate'
import { HookDapp } from '../../types/hooks'

interface HookItemProp {
  account: string | undefined
  hookDetails: CowHookDetails
  dapp: HookDapp | undefined
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  index: number
}

// TODO: remove once a tenderly bundle simulation is ready
const isBundleSimulationReady = false

export function AppliedHookItem({ account, hookDetails, dapp, isPreHook, editHook, removeHook, index }: HookItemProp) {
  // TODO: Determine the simulation status based on actual simulation results
  // For demonstration, using a placeholder. Replace with actual logic.
  const simulationPassed = true // TODO: Replace with actual condition
  const simulationStatus = simulationPassed ? 'Simulation successful' : 'Simulation failed'
  const simulationTooltip = simulationPassed
    ? 'The Tenderly simulation was successful. Your transaction is expected to succeed.'
    : 'The Tenderly simulation failed. Please review your transaction.'

  // TODO: Placeholder for Tenderly simulation URL; replace with actual logic when available
  const tenderlySimulationUrl = '' // e.g., 'https://tenderly.co/simulation/12345'

  // TODO: Determine if simulation passed or failed
  const isSimulationSuccessful = simulationPassed

  if (!dapp) return null

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

      {account && isBundleSimulationReady && (
        <styledEl.SimulateContainer isSuccessful={isSimulationSuccessful}>
          {isSimulationSuccessful ? (
            <SVG src={ICON_CHECK_ICON} color="green" width={16} height={16} aria-label="Simulation Successful" />
          ) : (
            <SVG src={ICON_X} color="red" width={14} height={14} aria-label="Simulation Failed" />
          )}
          {tenderlySimulationUrl ? (
            <a href={tenderlySimulationUrl} target="_blank" rel="noopener noreferrer">
              {simulationStatus}
              <ExternalLinkIcon size={14} />
            </a>
          ) : (
            <span>{simulationStatus}</span>
          )}
          <InfoTooltip content={simulationTooltip} />
        </styledEl.SimulateContainer>
      )}

      {!isBundleSimulationReady && (
        <styledEl.OldSimulateContainer>
          <div>
            <styledEl.SimulateHeader>
              <strong>Run a simulation</strong>
              <InfoTooltip content="This transaction can be simulated before execution to ensure that it will be succeed, generating a detailed report of the transaction execution." />
            </styledEl.SimulateHeader>
            <styledEl.SimulateFooter>
              <span>Powered by</span>
              <SVG src={TenderlyLogo} description="Tenderly" />
            </styledEl.SimulateFooter>
          </div>
          <div>
            <TenderlySimulate hook={hookDetails.hook} />
          </div>
        </styledEl.OldSimulateContainer>
      )}
    </styledEl.HookItemWrapper>
  )
}
