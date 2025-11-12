import React, { useCallback, useMemo, useState } from 'react'

import { useExtractText } from '@cowprotocol/common-utils'
import { renderTooltip, UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { TradeSelect, TradeSelectItem } from 'modules/trade/pure/TradeSelect'
import { Content } from 'modules/trade/pure/TradeWidgetField/styled'
import { LabelTooltip } from 'modules/twap'
import { customDeadlineToSeconds, deadlinePartsDisplay } from 'modules/twap/utils/deadlinePartsDisplay'

import { TradeWidgetField } from '../../../trade/pure/TradeWidgetField'
import { defaultCustomDeadline, TwapOrdersDeadline } from '../../state/twapOrdersSettingsAtom'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'

interface DeadlineSelectorProps {
  items: TradeSelectItem[]
  deadline: TwapOrdersDeadline
  isDeadlineDisabled: boolean
  label: LabelTooltip['label']
  tooltip: LabelTooltip['tooltip']

  setDeadline(value: TwapOrdersDeadline): void
}

const StyledTradeSelect = styled(TradeSelect)`
  font-weight: 500;
  color: inherit;

  button[data-reach-menu-button] {
    width: 100%;
    height: auto;
    justify-content: space-between;
    font-size: 18px;

    &:hover,
    &:active,
    &:focus {
      background: none;
      border-radius: 0;
    }
  }

  > svg {
    color: inherit;
    stroke: currentColor;
    opacity: 0.7;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover > svg {
    opacity: 1;
  }

  ${Content} {
    width: 100%;
    color: inherit;
  }

  ${Content} > div {
    width: 100%;
  }
`

const StyledTradeField = styled(TradeWidgetField)`
  ${Content} {
    width: 100%;
    color: inherit;
  }

  ${Content} > div {
    width: 100%;
  }
`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DeadlineSelector(props: DeadlineSelectorProps) {
  const {
    items,
    deadline: { deadline, customDeadline, isCustomDeadline },
    isDeadlineDisabled,
    label,
    tooltip,
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

  const activeLabelExtracted = extractTextFromStringOrI18nDescriptor(activeLabel) || ''

  return (
    <>
      {isDeadlineDisabled ? (
        <StyledTradeField label={label} tooltip={renderTooltip(tooltip)}>
          <div>{activeLabelExtracted}</div>
        </StyledTradeField>
      ) : (
        <StyledTradeSelect
          label={label}
          tooltip={renderTooltip(tooltip)}
          items={itemsWithCustom}
          activeLabel={activeLabelExtracted}
          onSelect={onSelect}
        />
      )}
      <CustomDeadlineSelector
        selectCustomDeadline={(value) => setDeadline({ isCustomDeadline: true, customDeadline: value, deadline: 0 })}
        customDeadline={customDeadline}
        onDismiss={() => setIsCustomModalOpen(false)}
        isOpen={isCustomModalOpen}
      />
    </>
  )
}
