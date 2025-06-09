import { useState } from 'react'

import { CowHookDetails, HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { ChevronDown, ChevronUp } from 'react-feather'

import { useSimulationData } from 'modules/tenderly/hooks/useSimulationData'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function HookItem({ details, item, index }: { details?: CowHookDetails; item: HookToDappMatch; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const simulationData = useSimulationData(details?.uuid)

  const dappName = item.dapp?.name || 'Unknown Hook'

  return (
    <styledEl.HookItemWrapper as="li">
      <styledEl.HookItemHeader
        onClick={() => setIsOpen(!isOpen)}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.HOOKS,
          action: 'Click Hook Details',
          label: `${dappName} - ${isOpen ? 'Collapse' : 'Expand'}`,
        })}
      >
        <styledEl.HookItemInfo>
          <styledEl.HookNumber>{index + 1}</styledEl.HookNumber>
          {item.dapp ? (
            <>
              <img src={item.dapp.image} alt={item.dapp.name} />
              <span>{item.dapp.name}</span>
            </>
          ) : (
            <span>Unknown hook dapp</span>
          )}
        </styledEl.HookItemInfo>
        <styledEl.ToggleIcon isOpen={isOpen}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </styledEl.ToggleIcon>
      </styledEl.HookItemHeader>
      {isOpen && (
        <styledEl.HookItemContent>
          {item.dapp && (
            <>
              {simulationData && (
                <p>
                  <b>Simulation:</b>
                  <styledEl.SimulationLink status={simulationData.status}>
                    <a
                      href={simulationData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-click-event={toCowSwapGtmEvent({
                        category: CowSwapAnalyticsCategory.HOOKS,
                        action: 'Click Simulation',
                        label: `${dappName} - ${simulationData.status ? 'Success' : 'Failed'}`,
                      })}
                    >
                      {simulationData.status ? 'Simulation successful' : 'Simulation failed'}
                    </a>
                  </styledEl.SimulationLink>
                </p>
              )}
              <p>
                <b>Description:</b> {item.dapp.descriptionShort}
              </p>
              <p>
                <b>Version:</b> {item.dapp.version}
              </p>
              <p>
                <b>Website:</b>{' '}
                <a
                  href={item.dapp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.HOOKS,
                    action: 'Click Website',
                    label: `${dappName} - ${new URL(item.dapp.website).hostname}`,
                  })}
                >
                  {item.dapp.website}
                </a>
              </p>
            </>
          )}
          <p>
            <b>calldata:</b> {item.hook.callData}
          </p>
          <p>
            <b>target:</b> {item.hook.target}
          </p>
          <p>
            <b>gasLimit:</b> {item.hook.gasLimit}
          </p>
        </styledEl.HookItemContent>
      )}
    </styledEl.HookItemWrapper>
  )
}
