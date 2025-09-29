import { useState } from 'react'

import { CowHookDetails, HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown, ChevronUp } from 'react-feather'

import { useSimulationData } from 'modules/tenderly/hooks/useSimulationData'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function HookItem({ details, item, index }: { details?: CowHookDetails; item: HookToDappMatch; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const simulationData = useSimulationData(details?.uuid)
  const { i18n } = useLingui()

  const dappName = item.dapp?.name || t`Unknown Hook`

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
              <img src={item.dapp.image} alt={i18n._(item.dapp.name)} />
              <span>{i18n._(item.dapp.name)}</span>
            </>
          ) : (
            <span>
              <Trans>Unknown hook dapp</Trans>
            </span>
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
                  <b>
                    <Trans>Simulation:</Trans>
                  </b>
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
                      {simulationData.status ? <Trans>Simulation successful</Trans> : <Trans>Simulation failed</Trans>}
                    </a>
                  </styledEl.SimulationLink>
                </p>
              )}
              <p>
                <b>
                  <Trans>Description</Trans>:
                </b>{' '}
                {item.dapp?.descriptionShort ? i18n._(item.dapp.descriptionShort) : ''}
              </p>
              <p>
                <b>
                  <Trans>Version</Trans>:
                </b>{' '}
                {item.dapp.version}
              </p>
              <p>
                <b>
                  <Trans>Website</Trans>:
                </b>{' '}
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
