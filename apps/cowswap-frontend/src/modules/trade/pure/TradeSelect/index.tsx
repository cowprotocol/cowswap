import { ReactNode } from 'react'

import { ContextMenu, ContextMenuButton, ContextMenuItem, ContextMenuList } from '@cowprotocol/ui'

import { ChevronDown } from 'react-feather'

import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'

export type TradeSelectItem = { label: string; value: unknown }

export interface TradeSelectProps extends TradeWidgetFieldProps {
  activeLabel: string
  items: TradeSelectItem[]
  onSelect(item: TradeSelectItem): void
  className?: string
}

export function TradeSelect(props: TradeSelectProps): ReactNode {
  const { activeLabel, items, onSelect, className } = props
  return (
    <TradeWidgetField {...props}>
      <div>
        <ContextMenu>
          <ContextMenuButton className={className}>
            {activeLabel} <ChevronDown size={20} />
          </ContextMenuButton>
          <ContextMenuList>
            {items.map((item) => {
              return (
                <ContextMenuItem key={item.label} onSelect={() => onSelect(item)}>
                  {item.label}
                </ContextMenuItem>
              )
            })}
          </ContextMenuList>
        </ContextMenu>
      </div>
    </TradeWidgetField>
  )
}
