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
        label="Total time"
        hint="TODO: Some hint"
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
