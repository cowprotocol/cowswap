import { ReactNode } from 'react'

import { useExtractText } from '@cowprotocol/common-utils'
import { ContextMenu, ContextMenuButton, ContextMenuItem, ContextMenuList } from '@cowprotocol/ui'

import { MessageDescriptor } from '@lingui/core'
import { ChevronDown } from 'react-feather'

import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'

export type TradeSelectItem = { label: string | MessageDescriptor; value: unknown }

export interface TradeSelectProps extends TradeWidgetFieldProps {
  activeLabel: string
  items: TradeSelectItem[]
  onSelect(item: TradeSelectItem): void
  className?: string
}

export function TradeSelect(props: TradeSelectProps): ReactNode {
  const { activeLabel, items, onSelect, className } = props
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()

  return (
    <TradeWidgetField {...props}>
      <div>
        <ContextMenu>
          <ContextMenuButton className={className}>
            {activeLabel} <ChevronDown size={20} />
          </ContextMenuButton>
          <ContextMenuList>
            {items.map((item) => {
              const label = extractTextFromStringOrI18nDescriptor(item.label)
              return (
                <ContextMenuItem key={label} onSelect={() => onSelect(item)}>
                  {label}
                </ContextMenuItem>
              )
            })}
          </ContextMenuList>
        </ContextMenu>
      </div>
    </TradeWidgetField>
  )
}
