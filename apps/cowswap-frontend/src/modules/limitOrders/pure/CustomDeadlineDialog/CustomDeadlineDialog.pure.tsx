import { ChangeEventHandler, FocusEventHandler, ReactNode, useCallback, useEffect, useState } from 'react'

import { i18n } from '@lingui/core'

import { Command } from '@cowprotocol/types'
import { ConfirmBottomDrawerOrDialog } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import * as styledEl from './CustomDeadlineDialog.styled'

import {
  calculateMinMax,
  formatDateToLocalTime,
  getInputStartDate,
  getTimeZoneOffset,
  limitDateString,
} from '../DeadlineSelector/utils'

const CUSTOM_DEADLINE_INPUT_ID = 'custom-deadline'
const CUSTOM_DEADLINE_ERROR_ID = 'custom-deadline-error'

interface CustomDeadlineDialogProps {
  isOpen: boolean
  customDeadline: number | null
  onDismiss: Command
  selectCustomDeadline(deadline: number): void
}

export function CustomDeadlineDialog({
  isOpen,
  customDeadline,
  onDismiss,
  selectCustomDeadline,
}: CustomDeadlineDialogProps): ReactNode {
  const [[minDate, maxDate], setMinMax] = useState<[Date, Date]>(calculateMinMax)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>('')

  const min = limitDateString(minDate)
  const max = limitDateString(maxDate)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const minMax = calculateMinMax()
    setMinMax(minMax)
    setError(null)
    setValue(formatDateToLocalTime(getInputStartDate(customDeadline, minMax[0])))
  }, [customDeadline, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    try {
      const newDeadline = new Date(value).getTime()

      if (Number.isNaN(newDeadline)) {
        if (!value) {
          return
        }
        throw new Error()
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const minDateStr = minDate.toLocaleString(i18n.locale)
      const maxDateStr = maxDate.toLocaleString(i18n.locale)

      if (newDeadline < minDate.getTime()) {
        setError(t`Must be after ${minDateStr} ${timeZone}`)
      } else if (newDeadline > maxDate.getTime()) {
        setError(t`Must be before ${maxDateStr} ${timeZone}`)
      } else {
        setError(null)
      }
    } catch (e) {
      console.error(`[CustomDeadlineDialog] Failed to parse input value to Date`, value, e)
      setError(t`Failed to parse date and time provided`)
    }
  }, [isOpen, maxDate, minDate, value])

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value: nextValue } }) => {
      setValue(nextValue || formatDateToLocalTime(minDate))
    },
    [minDate],
  )

  const onFocus: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    // Bug fix for resetting input with `reset` button iOS
    // See https://github.com/facebook/react/issues/8938
    event.target.defaultValue = ''
  }, [])

  const handleApply = useCallback(() => {
    const newDeadline = Math.round(new Date(value + getTimeZoneOffset()).getTime() / 1000)

    if (Number.isNaN(newDeadline)) {
      setError(t`Failed to parse date and time provided`)
      return
    }

    selectCustomDeadline(newDeadline)
    onDismiss()
  }, [onDismiss, selectCustomDeadline, value])

  const content = (
    <>
      <styledEl.InputLabel htmlFor={CUSTOM_DEADLINE_INPUT_ID}>{t`Set custom deadline`}</styledEl.InputLabel>
      <styledEl.CustomInput
        type="datetime-local"
        id={CUSTOM_DEADLINE_INPUT_ID}
        aria-invalid={!!error}
        aria-describedby={error ? CUSTOM_DEADLINE_ERROR_ID : undefined}
        onChange={onChange}
        // For some reason, `min/max` values require the same format as `value`,
        // but they don't need to be in the user's timezone
        min={min}
        max={max}
        value={value}
        // The `pattern` is not used at all in `datetime-local` input, but is in place
        // to enforce it when it isn't support. In that case it's rendered as a regular `text` input
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
        onFocus={onFocus}
      />
      {error ? <styledEl.ErrorText id={CUSTOM_DEADLINE_ERROR_ID}>{error}</styledEl.ErrorText> : null}
    </>
  )

  return (
    <ConfirmBottomDrawerOrDialog
      isOpen={isOpen}
      title={t`Set custom deadline`}
      description={t`Choose a custom deadline for your limit order.`}
      content={content}
      cancelLabel={t`Cancel`}
      onCancel={onDismiss}
      confirmLabel={t`Apply`}
      onConfirm={handleApply}
      confirmDisabled={!!error}
      footerTopBorder
    />
  )
}
