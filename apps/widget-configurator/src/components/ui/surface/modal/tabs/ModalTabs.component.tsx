import { ReactElement, ReactNode, SyntheticEvent } from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'

import { modalTabsSx } from './ModalTabs.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export interface ModalLabelTabInfo<TValue extends string = string> {
  value: TValue
  label: string
  icon?: ReactElement
}

export interface ModalIconTabInfo<TValue extends string = string> {
  value: TValue
  tooltip: string
  icon: ReactElement
}

export type ModalTabInfo<TValue extends string = string> = ModalLabelTabInfo<TValue> | ModalIconTabInfo<TValue>

export function isIconOnlyModalTab<TValue extends string>(tab: ModalTabInfo<TValue>): tab is ModalIconTabInfo<TValue> {
  return 'tooltip' in tab
}

export function modalTabId(prefix: string, value: string): string {
  return `${prefix}-tab-${value}`
}

export function modalTabPanelId(prefix: string, value: string): string {
  return `${prefix}-tabpanel-${value}`
}

export interface ModalTabsProps<TValue extends string = string> {
  tabs: ModalTabInfo<TValue>[]
  value: TValue
  onChange: (event: SyntheticEvent, value: TValue) => void
  ariaLabel: string
  idPrefix?: string
  sx?: SxProps<Theme>
}

export function ModalTabs<TValue extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix = 'modal',
  sx,
}: ModalTabsProps<TValue>): ReactNode {
  return (
    <Box sx={[{ borderTop: 1, borderColor: 'divider' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Tabs value={value} onChange={onChange} aria-label={ariaLabel} sx={modalTabsSx}>
        {tabs.map((tab) =>
          isIconOnlyModalTab(tab) ? (
            <Tab
              key={tab.value}
              value={tab.value}
              id={modalTabId(idPrefix, tab.value)}
              aria-controls={modalTabPanelId(idPrefix, tab.value)}
              aria-label={tab.tooltip}
              icon={
                <Tooltip title={tab.tooltip} arrow placement="top">
                  <Box component="span" sx={{ display: 'inline-flex', lineHeight: 0 }}>
                    {tab.icon}
                  </Box>
                </Tooltip>
              }
            />
          ) : (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              id={modalTabId(idPrefix, tab.value)}
              aria-controls={modalTabPanelId(idPrefix, tab.value)}
              {...(tab.icon ? { icon: tab.icon, iconPosition: 'start' as const } : {})}
            />
          ),
        )}
      </Tabs>
    </Box>
  )
}
