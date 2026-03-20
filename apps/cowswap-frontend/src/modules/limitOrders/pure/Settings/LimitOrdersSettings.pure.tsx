import { ReactNode, useCallback, useMemo } from 'react'

import {
  FormOption,
  Select,
  SettingsDropdownSection,
  SettingsBox,
  SimpleStyledText,
  SettingsLabel,
  SettingsBoxGroup,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

import { getOrdersTableSettings, SettingsContainer } from 'modules/trade'

import * as styledEl from './LimitOrdersSettings.styled'

import { useLimitOrderSettingsAnalytics } from '../../hooks/useLimitOrderSettingsAnalytics'
import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: LimitOrdersSettingsState) => void
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function LimitOrdersSettingsDropdown({ state, onStateChanged }: SettingsProps): ReactNode {
  const { i18n } = useLingui()
  const { LEFT_ALIGNED } = getOrdersTableSettings()
  const analytics = useLimitOrderSettingsAnalytics()
  const {
    showRecipient,
    partialFillsEnabled,
    limitPricePosition,
    limitPriceLocked,
    ordersTableOnLeft,
    // TODO: Temporarily disabled - Global USD Mode feature
    // isUsdValuesMode,
  } = state

  const handleRecipientToggle = useCallback(() => {
    const newValue = !showRecipient
    analytics.toggleCustomRecipient(newValue)
    onStateChanged({ ...state, showRecipient: newValue })
  }, [analytics, onStateChanged, state, showRecipient])

  const handlePartialFillsToggle = useCallback(() => {
    const newValue = !partialFillsEnabled
    analytics.togglePartialExecutions(newValue)
    onStateChanged({ ...state, partialFillsEnabled: newValue })
  }, [analytics, onStateChanged, state, partialFillsEnabled])

  const handleSelect = useCallback(
    (value: LimitOrdersSettingsState['limitPricePosition']) => (e: React.MouseEvent) => {
      e.stopPropagation()
      analytics.changeLimitPricePosition(limitPricePosition, value)
      onStateChanged({ ...state, limitPricePosition: value })
    },
    [analytics, onStateChanged, state, limitPricePosition],
  )

  const handleLimitPriceLockedToggle = useCallback(() => {
    const newValue = !limitPriceLocked
    analytics.toggleLockLimitPrice(newValue)
    onStateChanged({ ...state, limitPriceLocked: newValue })
  }, [analytics, onStateChanged, state, limitPriceLocked])

  const handleOrdersTablePositionToggle = useCallback(() => {
    const newValue = !ordersTableOnLeft
    analytics.toggleOrdersTablePosition(newValue)
    onStateChanged({ ...state, ordersTableOnLeft: newValue })
  }, [analytics, onStateChanged, state, ordersTableOnLeft])

  const handleContainerClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
  }

  const positionOptions: FormOption<LimitOrdersSettingsState['limitPricePosition']>[] = useMemo(() => {
    return [
      { label: t`Top`, value: 'top' },
      { label: t`Between currencies`, value: 'between' },
      { label: t`Bottom`, value: 'bottom' },
    ]
  }, [])

  return (
    <div onClick={handleContainerClick}>
      <SettingsContainer>
        <SettingsDropdownSection title={t`Limit Settings`}>
          <SettingsBoxGroup>
            <SettingsBox
              title={t`Custom Recipient`}
              tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
              checked={showRecipient}
              toggle={handleRecipientToggle}
            />

            <SettingsBox
              title={t`Enable Partial Executions`}
              tooltip={
                <Trans>
                  <SimpleStyledText>
                    <p>
                      Allows you to choose whether your limit orders will be <i>Partially fillable</i> or{' '}
                      <i>Fill or kill</i>.
                    </p>
                    <ul>
                      <li>
                        <i>Partially fillable</i> orders may be filled partially if there isn't enough liquidity to fill
                        the full amount.
                      </li>
                      <li>
                        <i>Fill or kill</i> orders will either be filled fully or not at all.
                      </li>
                    </ul>
                  </SimpleStyledText>
                </Trans>
              }
              checked={partialFillsEnabled}
              toggle={handlePartialFillsToggle}
            />

            <SettingsBox
              title={t`Lock Limit Price`}
              tooltip={t`When enabled, the limit price stays fixed when changing the BUY amount. When disabled, the limit price will update based on the BUY amount changes.`}
              checked={limitPriceLocked}
              toggle={handleLimitPriceLockedToggle}
            />
          </SettingsBoxGroup>
        </SettingsDropdownSection>

        <SettingsDropdownSection title={t`Limit Interface`}>
          {/* TODO: Temporarily disabled - Global USD Mode feature and isUsdValuesMode
          <SettingsBox
            title={t`Global USD Mode`}
            tooltip={t`When enabled, all prices will be displayed in USD by default.`}
            checked={isUsdValuesMode}
            toggle={handleUsdValuesModeToggle}
          /> */}

          <SettingsBox
            title={i18n._(LEFT_ALIGNED.title)}
            tooltip={i18n._(LEFT_ALIGNED.tooltip)}
            checked={ordersTableOnLeft}
            toggle={handleOrdersTablePositionToggle}
          />

          <styledEl.SettingsRow>
            <SettingsLabel
              title={t`Limit Price Position`}
              tooltip={t`Choose where to display the limit price input.`}
            />
            <Select
              variant="text"
              name="limitPricePosition"
              value={limitPricePosition}
              options={positionOptions}
              onChange={handleSelect}
            />
          </styledEl.SettingsRow>
        </SettingsDropdownSection>
      </SettingsContainer>
    </div>
  )
}
