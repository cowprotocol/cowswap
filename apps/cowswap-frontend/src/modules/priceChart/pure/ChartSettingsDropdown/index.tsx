import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { NewTooltip, SettingsBox, SettingsBoxGroup, SettingsDropdownSection } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { Menu, MenuPopover } from '@reach/menu-button'

import { SettingsButton, SettingsIcon } from 'modules/trade'

import * as styledEl from './styled'

import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import type { PriceChartSizeControl } from '../../lib/priceChart.types'

interface ChartSettingsDropdownProps {
  sizeControl?: PriceChartSizeControl
}

export function ChartSettingsDropdown({ sizeControl }: ChartSettingsDropdownProps): ReactNode {
  const { t } = useLingui()
  const [supplyBasis, setSupplyBasis] = useAtom(priceChartSupplyBasisAtom)

  return (
    <Menu>
      <NewTooltip content={t`Chart settings`} placement="top">
        <SettingsButton aria-label={t`Chart settings`}>
          <SettingsIcon />
        </SettingsButton>
      </NewTooltip>
      <MenuPopover
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
                title={t`Maximize price chart`}
                tooltip={t`Expand the price chart to use more space.`}
                checked={sizeControl?.isExpanded ?? false}
                toggle={() => sizeControl?.onToggle()}
                disabled={!sizeControl}
              />
              <SettingsBox
                title={t`Total supply for Market Cap`}
                tooltip={t`Market Cap is an approximation based on the latest reported supply. Total supply can include locked, burned, or otherwise non-circulating tokens.`}
                checked={supplyBasis === 'total'}
                toggle={() => setSupplyBasis((value) => (value === 'total' ? 'circulating' : 'total'))}
              />
            </SettingsBoxGroup>
          </SettingsDropdownSection>
        </styledEl.SettingsList>
      </MenuPopover>
    </Menu>
  )
}
