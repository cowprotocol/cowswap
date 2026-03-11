import { ReactNode, useState } from 'react'

import { ButtonPrimary, ButtonSecondary } from '@cowprotocol/ui'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { Settings, X } from 'react-feather'

import * as styledEl from './TwapPrototypePanel.styled'

import { useIsTwapEoaPrototypeEnabled } from '../../hooks/useIsTwapEoaPrototypeEnabled'
import { useTwapPrototypeOrders } from '../../hooks/useTwapPrototypeOrders'
import { TwapPrototypeScenario } from '../../types'
import { MANUAL_TWAP_PROTOTYPE_SCENARIOS } from '../../utils/prototypeScenarios'

interface ExpandedPrototypePanelProps {
  canCreatePrototypeOrders: boolean
  hasPrototypeOrders: boolean
  isPending: boolean
  createPrototypeOrder(): Promise<string | null>
  createPrototypeScenario(scenario: TwapPrototypeScenario): Promise<string | null>
  seedPrototypeOrders(): Promise<void>
  clearPrototypeOrders(): void
  onCollapse(): void
  withPendingState(callback: () => Promise<void | string | null>): Promise<void>
}

interface ScenarioLabelProps {
  scenario: TwapPrototypeScenario
}

export function TwapPrototypePanel(): ReactNode {
  const [isPending, setIsPending] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const isSafeWallet = useIsSafeWallet()
  const isTwapEoaPrototypeEnabled = useIsTwapEoaPrototypeEnabled()
  const {
    canCreatePrototypeOrders,
    hasPrototypeOrders,
    createPrototypeOrder,
    createPrototypeScenario,
    seedPrototypeOrders,
    clearPrototypeOrders,
  } = useTwapPrototypeOrders()

  if (!isTwapEoaPrototypeEnabled || isSafeWallet) {
    return null
  }

  const withPendingState = async (callback: () => Promise<void | string | null>): Promise<void> => {
    setIsPending(true)

    try {
      await callback()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <styledEl.FloatingWrapper>
      {isExpanded ? (
        <ExpandedPrototypePanel
          canCreatePrototypeOrders={canCreatePrototypeOrders}
          hasPrototypeOrders={hasPrototypeOrders}
          isPending={isPending}
          createPrototypeOrder={createPrototypeOrder}
          createPrototypeScenario={createPrototypeScenario}
          seedPrototypeOrders={seedPrototypeOrders}
          clearPrototypeOrders={clearPrototypeOrders}
          onCollapse={() => setIsExpanded(false)}
          withPendingState={withPendingState}
        />
      ) : (
        <styledEl.ToggleButton aria-label="Show prototype tools" onClick={() => setIsExpanded(true)}>
          <Settings size={22} />
          <span>
            <Trans>Prototype tools</Trans>
          </span>
        </styledEl.ToggleButton>
      )}
    </styledEl.FloatingWrapper>
  )
}

function ExpandedPrototypePanel({
  canCreatePrototypeOrders,
  hasPrototypeOrders,
  isPending,
  createPrototypeOrder,
  createPrototypeScenario,
  seedPrototypeOrders,
  clearPrototypeOrders,
  onCollapse,
  withPendingState,
}: ExpandedPrototypePanelProps): ReactNode {
  return (
    <styledEl.Panel>
      <styledEl.Header>
        <styledEl.Heading>
          <Trans>EOA prototype tools</Trans>
        </styledEl.Heading>
        <styledEl.CollapseButton aria-label="Hide prototype tools" onClick={onCollapse}>
          <X size={18} />
        </styledEl.CollapseButton>
      </styledEl.Header>
      <styledEl.Description>
        <Trans>
          Create local-only TWAP orders, seed demo lifecycle states, and inspect real table and receipt UI without a
          backend integration.
        </Trans>
      </styledEl.Description>
      <styledEl.StorageNote>
        <Trans>Prototype rows persist in local browser storage until you clear them.</Trans>
      </styledEl.StorageNote>
      <styledEl.Actions>
        <ButtonPrimary
          disabled={!canCreatePrototypeOrders || isPending}
          onClick={() => withPendingState(() => createPrototypeOrder())}
        >
          <Trans>Create auto-fill order</Trans>
        </ButtonPrimary>
        <ButtonSecondary
          disabled={!canCreatePrototypeOrders || isPending}
          onClick={() => withPendingState(seedPrototypeOrders)}
        >
          <Trans>Seed demo states</Trans>
        </ButtonSecondary>
        <ButtonSecondary disabled={!hasPrototypeOrders || isPending} onClick={clearPrototypeOrders}>
          <Trans>Clear prototype orders</Trans>
        </ButtonSecondary>
      </styledEl.Actions>
      <styledEl.Section>
        <styledEl.SectionTitle>
          <Trans>Add single lifecycle row</Trans>
        </styledEl.SectionTitle>
        <styledEl.SectionDescription>
          <Trans>Create one targeted prototype row from the current form without clearing the rest.</Trans>
        </styledEl.SectionDescription>
        <styledEl.ScenarioGrid>
          {MANUAL_TWAP_PROTOTYPE_SCENARIOS.map((scenario) => (
            <ButtonSecondary
              key={scenario}
              disabled={!canCreatePrototypeOrders || isPending}
              onClick={() => withPendingState(() => createPrototypeScenario(scenario))}
            >
              <ScenarioLabel scenario={scenario} />
            </ButtonSecondary>
          ))}
        </styledEl.ScenarioGrid>
      </styledEl.Section>
    </styledEl.Panel>
  )
}

function ScenarioLabel({ scenario }: ScenarioLabelProps): ReactNode {
  switch (scenario) {
    case TwapPrototypeScenario.StaticOpen:
      return <Trans>Static open</Trans>
    case TwapPrototypeScenario.AutoProgressOpen:
      return <Trans>Auto-progress</Trans>
    case TwapPrototypeScenario.Cancelling:
      return <Trans>Cancelling</Trans>
    case TwapPrototypeScenario.Cancelled:
      return <Trans>Cancelled</Trans>
    case TwapPrototypeScenario.PartiallyCancelled:
      return <Trans>Partially cancelled</Trans>
    case TwapPrototypeScenario.Expired:
      return <Trans>Expired</Trans>
    case TwapPrototypeScenario.PartiallyExpired:
      return <Trans>Partially expired</Trans>
    case TwapPrototypeScenario.Fulfilled:
      return <Trans>Filled</Trans>
  }

  return null
}
