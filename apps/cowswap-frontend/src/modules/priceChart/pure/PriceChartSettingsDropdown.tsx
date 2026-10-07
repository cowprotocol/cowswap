import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { NewTooltip, SettingsBox, SettingsBoxGroup, SettingsDropdownSection } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { Menu } from '@reach/menu-button'

import { SettingsButton, SettingsIcon } from 'modules/trade'

import * as styledEl from './PriceChartSettingsDropdown.styled'

import { priceChartSupplyVariantAtom } from '../state/priceChartSupplyVariantAtom'

import type { ExpansionControl } from '../lib/priceChart.types'

interface PriceChartSettingsDropdownProps {
  sizeControl?: ExpansionControl
}

export function PriceChartSettingsDropdown({ sizeControl }: PriceChartSettingsDropdownProps): ReactNode {
  const { t } = useLingui()
  const [supplyVariant, setSupplyVariant] = useAtom(priceChartSupplyVariantAtom)

  return (
    <Menu>
      <NewTooltip content={t`Chart settings`} placement="top">
        <SettingsButton aria-label={t`Chart settings`}>
          <SettingsIcon />
        </SettingsButton>
      </NewTooltip>
      <styledEl.SettingsPopover
        position={(buttonRect, menuRect) =>
          buttonRect && menuRect
            ? {
                left: Math.max(16, buttonRect.right - menuRect.width) + window.scrollX,
                top: buttonRect.bottom + window.scrollY,
              }
            : {}
        }
      >
        <styledEl.SettingsList>
          <SettingsDropdownSection title={t`Chart Settings`}>
            <SettingsBoxGroup>
              <SettingsBox
                title={t`Maximum width`}
                tooltip={t`Expand the price chart to use more space.`}
                checked={sizeControl?.isExpanded ?? false}
                toggle={() => sizeControl?.onToggle()}
                disabled={!sizeControl}
              />
              <SettingsBox
                title={t`Total Supply for Market Cap`}
                tooltip={t`Market Cap is an approximation based on the latest reported supply. Total Supply can include locked, burned, or otherwise non-circulating tokens. When disabled, Circulating Supply will be used.`}
                checked={supplyVariant === 'total'}
                toggle={() => setSupplyVariant((value) => (value === 'total' ? 'circulating' : 'total'))}
              />
            </SettingsBoxGroup>
          </SettingsDropdownSection>
        </styledEl.SettingsList>
      </styledEl.SettingsPopover>
    </Menu>
  )
}
