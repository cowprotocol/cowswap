import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, NewTooltip, SettingsBox, SettingsBoxGroup, SettingsDropdownSection } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { Menu } from '@reach/menu-button'

import { SettingsButton, SettingsIcon, SettingsMenu, SettingsMenuFlyout } from 'modules/trade'

import { priceChartSupplyVariantAtom } from '../state/priceChartSupplyVariantAtom'

import type { ExpansionControl } from '../lib/priceChart.types'

interface PriceChartSettingsDropdownProps {
  sizeControl?: ExpansionControl
}

export function PriceChartSettingsDropdown({ sizeControl }: PriceChartSettingsDropdownProps): ReactNode {
  const { t } = useLingui()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [supplyVariant, setSupplyVariant] = useAtom(priceChartSupplyVariantAtom)

  return (
    <Menu>
      <SettingsMenu className="chart-settings">
        <NewTooltip content={t`Chart settings`} placement="top">
          <SettingsButton aria-label={t`Chart settings`}>
            <SettingsIcon />
          </SettingsButton>
        </NewTooltip>
        <SettingsMenuFlyout portal={false}>
          <SettingsDropdownSection title={t`Chart Settings`}>
            <SettingsBoxGroup>
              {!isUpToLarge && (
                <SettingsBox
                  title={t`Maximum width`}
                  tooltip={t`Expand the price chart to use more space.`}
                  checked={sizeControl?.isExpanded ?? true}
                  toggle={() => sizeControl?.onToggle()}
                  disabled={!sizeControl}
                />
              )}
              <SettingsBox
                title={t`Total Supply for Market Cap`}
                tooltip={t`Market Cap is an approximation based on the latest reported supply. Total Supply can include locked, burned, or otherwise non-circulating tokens. When disabled, Circulating Supply will be used.`}
                checked={supplyVariant === 'total'}
                toggle={() => setSupplyVariant((value) => (value === 'total' ? 'circulating' : 'total'))}
              />
            </SettingsBoxGroup>
          </SettingsDropdownSection>
        </SettingsMenuFlyout>
      </SettingsMenu>
    </Menu>
  )
}
