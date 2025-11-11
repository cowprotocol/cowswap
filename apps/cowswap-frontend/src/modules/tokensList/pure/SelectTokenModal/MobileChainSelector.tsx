import { ReactNode, useMemo } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import * as styledEl from './mobileChainSelector.styled'

import { ChainsToSelectState } from '../../types'
import { getChainAccent } from '../ChainsSelector'

const MAX_VISIBLE_CHAINS = 3

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
  const orderedChains = useMemo(
    () => reorderChains(chainsState.chains ?? [], chainsState.defaultChainId),
    [chainsState.chains, chainsState.defaultChainId],
  )

  const totalChains = chainsState.chains?.length ?? 0
  const visibleChains = orderedChains.slice(0, MAX_VISIBLE_CHAINS)
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
        {remainingCount > 0 && (
          <styledEl.MoreChipButton onClick={onOpenPanel} aria-label={`Show all ${totalChains} networks`}>
            +{remainingCount} more
          </styledEl.MoreChipButton>
        )}
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

function reorderChains(chains: ChainInfo[], defaultChainId: ChainInfo['id'] | undefined): ChainInfo[] {
  if (!defaultChainId) {
    return [...chains]
  }

  const sorted = [...chains]
  const index = sorted.findIndex((chain) => chain.id === defaultChainId)

  if (index <= 0) {
    return sorted
  }

  const [current] = sorted.splice(index, 1)
  return [current, ...sorted]
}
