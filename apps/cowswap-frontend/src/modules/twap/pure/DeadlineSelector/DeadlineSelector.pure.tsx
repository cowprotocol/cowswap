import { ReactNode, useCallback, useMemo, useState } from 'react'

import { useExtractText } from '@cowprotocol/common-utils'
import { renderTooltip } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { TradeSelectItem } from 'modules/trade/pure/TradeSelect'
import { LabelTooltip, LabelTooltipFn, TotalDurationTooltipProps } from 'modules/twap'
import {
  customDeadlineToSeconds,
  deadlinePartsDisplay,
  secondsToCustomDeadline,
} from 'modules/twap/utils/deadlinePartsDisplay'

import * as styledEl from './DeadlineSelector.styled'

import { defaultCustomDeadline, TwapOrdersDeadline } from '../../state/twapOrdersSettingsAtom'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector/CustomDeadlineSelector.pure'

interface DeadlineSelectorProps {
  items: TradeSelectItem[]
  deadline: TwapOrdersDeadline
  isDeadlineDisabled: boolean
  label: LabelTooltip['label']
  tooltip: LabelTooltipFn<TotalDurationTooltipProps>
  parts: number
  partDuration: number

  setDeadline(value: TwapOrdersDeadline): void
}

// TODO: Break down this large function into smaller functions
export function DeadlineSelector(props: DeadlineSelectorProps): ReactNode {
  const {
    items,
    deadline: { deadline, customDeadline, isCustomDeadline },
    isDeadlineDisabled,
    label,
    tooltip,
    parts,
    partDuration,
    setDeadline,
  } = props
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()
  const { t } = useLingui()

  const CUSTOM_OPTION: TradeSelectItem = useMemo((): TradeSelectItem => {
    return { label: t`Custom`, value: 'CUSTOM_ITEM_VALUE' }
  }, [t])

  const itemsWithCustom = useMemo(() => {
    return [...items, CUSTOM_OPTION]
  }, [CUSTOM_OPTION, items])

  const onSelect = useCallback(
    (item: TradeSelectItem) => {
      if (item === CUSTOM_OPTION) {
        setIsCustomModalOpen(true)
      } else {
        setDeadline({
          isCustomDeadline: false,
          deadline: item.value as number,
          customDeadline: defaultCustomDeadline,
        })
      }
    },
    [CUSTOM_OPTION, setDeadline],
  )

  const activeLabel = useMemo(() => {
    if (isCustomDeadline) {
      return deadlinePartsDisplay(customDeadlineToSeconds(customDeadline))
    }

    return items.find((item) => item.value === deadline)?.label || ''
  }, [items, deadline, customDeadline, isCustomDeadline])

  const customDeadlineForModal = useMemo(() => {
    if (isCustomDeadline) {
      return customDeadline
    }

    return secondsToCustomDeadline(deadline / 1000)
  }, [customDeadline, deadline, isCustomDeadline])

  const activeLabelExtracted = extractTextFromStringOrI18nDescriptor(activeLabel) || ''
  const fieldTooltip = renderTooltip(tooltip, { parts, partDuration })

  return (
    <>
      {isDeadlineDisabled ? (
        <styledEl.StyledTradeField label={label} tooltip={fieldTooltip}>
          <div>{activeLabelExtracted}</div>
        </styledEl.StyledTradeField>
      ) : (
        <styledEl.StyledTradeSelect
          label={label}
          tooltip={fieldTooltip}
          items={itemsWithCustom}
          activeLabel={activeLabelExtracted}
          onSelect={onSelect}
        />
      )}
      <CustomDeadlineSelector
        selectCustomDeadline={(value) => setDeadline({ isCustomDeadline: true, customDeadline: value, deadline: 0 })}
        customDeadline={customDeadlineForModal}
        onDismiss={() => setIsCustomModalOpen(false)}
        isOpen={isCustomModalOpen}
        parts={parts}
        partDuration={partDuration}
      />
    </>
  )
}
