import { ReactNode, useMemo } from 'react'

import { useMediaQuery, useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { ChevronDown } from 'react-feather'

import * as styledEl from './mobileChainSelector.styled'

import { ChainsToSelectState } from '../../types'
import { sortChainsByDisplayOrder } from '../../utils/sortChainsByDisplayOrder'
import { getChainAccent } from '../ChainsSelector'

interface MobileChainSelectorProps {
  chainsState: ChainsToSelectState
  label?: string
  onSelectChain(chain: ChainInfo): void
  onOpenPanel(): void
}

export function MobileChainSelector({
  chainsState,
  label,
  onSelectChain,
  onOpenPanel,
}: MobileChainSelectorProps): ReactNode {
  const maxVisibleChains = useMaxVisibleChains()
  const orderedChains = useMemo(
    () =>
      sortChainsByDisplayOrder(chainsState.chains ?? [], {
        pinChainId: chainsState.defaultChainId,
      }),
    [chainsState.chains, chainsState.defaultChainId],
  )

  const totalChains = chainsState.chains?.length ?? 0
  const visibleChains = orderedChains.slice(0, maxVisibleChains)
  const remainingCount = Math.max(totalChains - visibleChains.length, 0)

  return (
    <styledEl.MobileSelectorRow>
      {label ? (
        <styledEl.MobileSelectorLabel>
          <span>{label}</span>
        </styledEl.MobileSelectorLabel>
      ) : null}
      <styledEl.ChipsWrapper>
        {visibleChains.map((chain) => (
          <ChainChip
            key={chain.id}
            chain={chain}
            isActive={chainsState.defaultChainId === chain.id}
            onSelectChain={onSelectChain}
          />
        ))}
        {remainingCount > 0 ? (
          <styledEl.MoreChipButton onClick={onOpenPanel} aria-label={`Show all ${totalChains} networks`}>
            <span>All networks ({totalChains})</span>
            <ChevronDown size={14} />
          </styledEl.MoreChipButton>
        ) : null}
      </styledEl.ChipsWrapper>
    </styledEl.MobileSelectorRow>
  )
}

interface ChainChipProps {
  chain: ChainInfo
  isActive: boolean
  onSelectChain(chain: ChainInfo): void
}

function ChainChip({ chain, isActive, onSelectChain }: ChainChipProps): ReactNode {
  const { darkMode } = useTheme()
  const accent = getChainAccent(chain.id)
  const logoSrc = darkMode ? chain.logo.dark : chain.logo.light

  return (
    <styledEl.ChainChipButton
      type="button"
      onClick={() => onSelectChain(chain)}
      $active={isActive}
      $accent={accent}
      aria-pressed={isActive}
    >
      <img src={logoSrc} alt={chain.label} loading="lazy" />
    </styledEl.ChainChipButton>
  )
}

function useMaxVisibleChains(): number {
  const isUpToTiny = useMediaQuery(Media.upToTiny(false))
  const isUpToSmall = useMediaQuery(Media.upToSmall(false))

  if (isUpToTiny) {
    return 3
  }

  if (isUpToSmall) {
    return 4
  }

  return 6
}
