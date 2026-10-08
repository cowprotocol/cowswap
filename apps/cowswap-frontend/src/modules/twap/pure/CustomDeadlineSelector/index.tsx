import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Command } from '@cowprotocol/types'
import { ConfirmBottomDrawerOrDialog } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Plural, Trans } from '@lingui/react/macro'

import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { customDeadlineToSeconds } from 'modules/twap/utils/deadlinePartsDisplay'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import * as styledEl from './styled'

import { PaddedDeadlineDisplay } from '../PaddedDeadlineDisplay/PaddedDeadlineDisplay.pure'

type CustomDeadline = { hours: number; minutes: number }

interface CustomDeadlineSelectorProps {
  isOpen: boolean
  parts: number
  partDuration: number
  onDismiss: Command
  customDeadline: CustomDeadline
  selectCustomDeadline(deadline: CustomDeadline): void
}

export function CustomDeadlineSelector({
  isOpen,
  parts,
  partDuration,
  onDismiss,
  customDeadline,
  selectCustomDeadline,
}: CustomDeadlineSelectorProps): ReactNode {
  const { hours = 0, minutes = 0 } = customDeadline
  const analytics = useCowAnalytics()

  const [hoursValue, setHoursValue] = useState(hours)
  const [minutesValue, setMinutesValue] = useState(minutes)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setHoursValue(hours)
    setMinutesValue(minutes)
  }, [isOpen, hours, minutes])

  const onHoursChange = useCallback((v: number | null) => setHoursValue(!v ? 0 : Math.round(v)), [])
  const onMinutesChange = useCallback((v: number | null) => setMinutesValue(!v ? 0 : Math.round(v)), [])

  const isDisabled = !hoursValue && !minutesValue

  const description = useMemo(() => {
    const hasCustomInput = hoursValue > 0 || minutesValue > 0
    const totalDuration = hasCustomInput
      ? customDeadlineToSeconds({ hours: hoursValue, minutes: minutesValue })
      : parts * partDuration
    const resolvedPartDuration = hasCustomInput && parts > 0 ? Math.ceil(totalDuration / parts) : partDuration

    return (
      <>
        <p>
          <Trans>The "Total duration" is the duration it takes to execute all parts of your TWAP order.</Trans>
        </p>
        <p>
          <Trans>
            For instance, your order consists of{' '}
            <b>
              <Plural value={parts} one="# part" few="# parts" many="# parts" other="# parts" />
            </b>{' '}
            placed every <PaddedDeadlineDisplay seconds={resolvedPartDuration} />, the total time to complete the order
            is <PaddedDeadlineDisplay seconds={totalDuration} />. Each limit order remains open for{' '}
            <PaddedDeadlineDisplay seconds={resolvedPartDuration} /> until the next part becomes active.
          </Trans>
        </p>
      </>
    )
  }, [hoursValue, minutesValue, partDuration, parts])

  const handleApply = useCallback(() => {
    analytics.sendEvent({
      category: CowSwapAnalyticsCategory.TWAP,
      action: 'Apply custom deadline',
      label: `${hoursValue}h ${minutesValue}m`,
    })
    selectCustomDeadline({
      hours: hoursValue,
      minutes: minutesValue,
    })
    onDismiss()
  }, [analytics, hoursValue, minutesValue, onDismiss, selectCustomDeadline])

  const content = (
    <styledEl.InputsGrid>
      <TradeNumberInput
        label={t`Hours`}
        onUserInput={onHoursChange}
        value={hoursValue}
        showUpDownArrows
        min={0}
        max={null}
      />
      <TradeNumberInput
        label={t`Minutes`}
        onUserInput={onMinutesChange}
        value={minutesValue}
        showUpDownArrows
        min={0}
        max={null}
      />
    </styledEl.InputsGrid>
  )

  return (
    <ConfirmBottomDrawerOrDialog
      isOpen={isOpen}
      title={t`TWAP total duration`}
      description={description}
      content={content}
      cancelLabel={t`Cancel`}
      onCancel={onDismiss}
      confirmLabel={t`Apply`}
      onConfirm={handleApply}
      confirmDisabled={isDisabled}
    />
  )
}
