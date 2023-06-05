import React, { useCallback, useMemo, useState } from 'react'

import styled from 'styled-components/macro'

import { TradeSelect, TradeSelectItem } from 'modules/trade/pure/TradeSelect'

import { defaultCustomDeadline, TwapOrdersDeadline } from '../../state/twapOrdersSettingsAtom'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'

interface DeadlineSelectorProps {
  items: TradeSelectItem[]
  deadline: TwapOrdersDeadline
  setDeadline(value: TwapOrdersDeadline): void
}

const CUSTOM_OPTION: TradeSelectItem = { label: 'Custom', value: 'CUSTOM_ITEM_VALUE' }
const LABEL = 'Total duration'
const TOOLTIP_CONTENT = `The "Total duration" is the duration it takes to execute all parts of your TWAP order.
For instance, your order consists of 2 parts placed every 30 minutes, the total time to complete the order is 1 hour. Each limit order remains open for 30 minutes until the next part becomes active.`

const StyledTradeSelect = styled(TradeSelect)`
  font-size: 14px;
  font-weight: 500;
`

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const {
    items,
    deadline: { deadline, customDeadline, isCustomDeadline },
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
      return `${customDeadline.hours}h ${customDeadline.minutes}m`
    }

    return items.find((item) => item.value === deadline)?.label || ''
  }, [items, deadline, customDeadline, isCustomDeadline])

  return (
    <>
      <StyledTradeSelect
        label={LABEL}
        hint={TOOLTIP_CONTENT}
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
