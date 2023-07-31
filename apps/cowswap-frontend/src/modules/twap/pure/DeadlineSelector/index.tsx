import React, { useCallback, useMemo, useState } from 'react'

import styled from 'styled-components/macro'

import { renderTooltip } from 'legacy/components/Tooltip'

import { TradeSelect, TradeSelectItem } from 'modules/trade/pure/TradeSelect'
import { Content } from 'modules/trade/pure/TradeWidgetField/styled'
import { LabelTooltip } from 'modules/twap'
import { customDeadlineToSeconds, deadlinePartsDisplay } from 'modules/twap/utils/deadlinePartsDisplay'

import { defaultCustomDeadline, TwapOrdersDeadline } from '../../state/twapOrdersSettingsAtom'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'

interface DeadlineSelectorProps {
  items: TradeSelectItem[]
  deadline: TwapOrdersDeadline
  label: LabelTooltip['label']
  tooltip: LabelTooltip['tooltip']
  setDeadline(value: TwapOrdersDeadline): void
}

const CUSTOM_OPTION: TradeSelectItem = { label: 'Custom', value: 'CUSTOM_ITEM_VALUE' }

const StyledTradeSelect = styled(TradeSelect)`
  font-weight: 500;

  ${Content} {
    width: 100%;
  }

  ${Content} > div {
    width: 100%;
  }
`

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const {
    items,
    deadline: { deadline, customDeadline, isCustomDeadline },
    label,
    tooltip,
    setDeadline,
  } = props
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  const itemsWithCustom = useMemo(() => {
    return [...items, CUSTOM_OPTION]
  }, [items])

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
    [setIsCustomModalOpen, setDeadline]
  )

  const activeLabel = useMemo(() => {
    if (isCustomDeadline) {
      return deadlinePartsDisplay(customDeadlineToSeconds(customDeadline))
    }

    return items.find((item) => item.value === deadline)?.label || ''
  }, [items, deadline, customDeadline, isCustomDeadline])

  return (
    <>
      <StyledTradeSelect
        label={label}
        tooltip={renderTooltip(tooltip)}
        items={itemsWithCustom}
        activeLabel={activeLabel}
        onSelect={onSelect}
      />
      <CustomDeadlineSelector
        selectCustomDeadline={(value) => setDeadline({ isCustomDeadline: true, customDeadline: value, deadline: 0 })}
        customDeadline={customDeadline}
        onDismiss={() => setIsCustomModalOpen(false)}
        isOpen={isCustomModalOpen}
      />
    </>
  )
}
