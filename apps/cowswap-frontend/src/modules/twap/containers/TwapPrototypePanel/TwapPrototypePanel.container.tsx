import { ReactNode, useState } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { ButtonPrimary, ButtonSecondary } from '@cowprotocol/ui'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { Settings, X } from 'react-feather'

import * as styledEl from './TwapPrototypePanel.styled'

import { useIsTwapEoaPrototypeEnabled } from '../../hooks/useIsTwapEoaPrototypeEnabled'
import { useOpenTwapPrototypeProxyPage } from '../../hooks/useOpenTwapPrototypeProxyPage'
import { useTwapPrototypeOrders } from '../../hooks/useTwapPrototypeOrders'
import { useTwapPrototypeProxy } from '../../hooks/useTwapPrototypeProxy'
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
  proxyAddress: string | null
  hasClaimableFunds: boolean
  hasWithdrawnFunds: boolean
  hasActiveFunds: boolean
  hasWithdrawnActiveFunds: boolean
  activeOrdersCount: number
  claimableOrdersCount: number
  withdrawnActiveOrdersCount: number
  openProxyPage(): void
  withdrawAllClaimableFunds(): void
  withdrawAllFunds(): void
  resetWithdrawnFunds(): void
  onCollapse(): void
  withPendingState(callback: () => Promise<void | string | null>): Promise<void>
}

interface PrototypeOrderActionsSectionProps {
  canCreatePrototypeOrders: boolean
  hasPrototypeOrders: boolean
  isPending: boolean
  createPrototypeOrder(): Promise<string | null>
  seedPrototypeOrders(): Promise<void>
  clearPrototypeOrders(): void
  withPendingState(callback: () => Promise<void | string | null>): Promise<void>
}

interface PrototypeProxySectionProps {
  proxyAddress: string | null
  hasClaimableFunds: boolean
  hasWithdrawnFunds: boolean
  hasActiveFunds: boolean
  hasWithdrawnActiveFunds: boolean
  activeOrdersCount: number
  claimableOrdersCount: number
  withdrawnActiveOrdersCount: number
  isPending: boolean
  openProxyPage(): void
  withdrawAllClaimableFunds(): void
  withdrawAllFunds(): void
  resetWithdrawnFunds(): void
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
  const openProxyPage = useOpenTwapPrototypeProxyPage()
  const {
    canCreatePrototypeOrders,
    hasPrototypeOrders,
    createPrototypeOrder,
    createPrototypeScenario,
    seedPrototypeOrders,
    clearPrototypeOrders,
  } = useTwapPrototypeOrders()
  const {
    proxyAddress,
    activeOrders,
    claimableOrders,
    withdrawnActiveOrders,
    withdrawnTokens,
    hasClaimableFunds,
    hasActiveFunds,
    hasWithdrawnActiveFunds,
    withdrawAllClaimableFunds,
    withdrawAllFunds,
    resetWithdrawnFunds,
  } = useTwapPrototypeProxy()

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
          proxyAddress={proxyAddress}
          hasClaimableFunds={hasClaimableFunds}
          hasWithdrawnFunds={withdrawnTokens.length > 0}
          hasActiveFunds={hasActiveFunds}
          hasWithdrawnActiveFunds={hasWithdrawnActiveFunds}
          activeOrdersCount={activeOrders.length}
          claimableOrdersCount={claimableOrders.length}
          withdrawnActiveOrdersCount={withdrawnActiveOrders.length}
          openProxyPage={openProxyPage}
          withdrawAllClaimableFunds={withdrawAllClaimableFunds}
          withdrawAllFunds={withdrawAllFunds}
          resetWithdrawnFunds={resetWithdrawnFunds}
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
  proxyAddress,
  hasClaimableFunds,
  hasWithdrawnFunds,
  hasActiveFunds,
  hasWithdrawnActiveFunds,
  activeOrdersCount,
  claimableOrdersCount,
  withdrawnActiveOrdersCount,
  openProxyPage,
  withdrawAllClaimableFunds,
  withdrawAllFunds,
  resetWithdrawnFunds,
  onCollapse,
  withPendingState,
}: ExpandedPrototypePanelProps): ReactNode {
  return (
    <styledEl.Panel>
      <PrototypePanelIntro onCollapse={onCollapse} />
      <styledEl.BodyGrid>
        <styledEl.Column>
          <PrototypeOrderActionsSection
            canCreatePrototypeOrders={canCreatePrototypeOrders}
            hasPrototypeOrders={hasPrototypeOrders}
            isPending={isPending}
            createPrototypeOrder={createPrototypeOrder}
            seedPrototypeOrders={seedPrototypeOrders}
            clearPrototypeOrders={clearPrototypeOrders}
            withPendingState={withPendingState}
          />
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
        </styledEl.Column>
        <styledEl.Column>
          <PrototypeProxySection
            proxyAddress={proxyAddress}
            hasClaimableFunds={hasClaimableFunds}
            hasWithdrawnFunds={hasWithdrawnFunds}
            hasActiveFunds={hasActiveFunds}
            hasWithdrawnActiveFunds={hasWithdrawnActiveFunds}
            activeOrdersCount={activeOrdersCount}
            claimableOrdersCount={claimableOrdersCount}
            withdrawnActiveOrdersCount={withdrawnActiveOrdersCount}
            isPending={isPending}
            openProxyPage={openProxyPage}
            withdrawAllClaimableFunds={withdrawAllClaimableFunds}
            withdrawAllFunds={withdrawAllFunds}
            resetWithdrawnFunds={resetWithdrawnFunds}
            withPendingState={withPendingState}
          />
        </styledEl.Column>
      </styledEl.BodyGrid>
    </styledEl.Panel>
  )
}

function PrototypeOrderActionsSection({
  canCreatePrototypeOrders,
  hasPrototypeOrders,
  isPending,
  createPrototypeOrder,
  seedPrototypeOrders,
  clearPrototypeOrders,
  withPendingState,
}: PrototypeOrderActionsSectionProps): ReactNode {
  return (
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
  )
}

function PrototypePanelIntro({ onCollapse }: Pick<ExpandedPrototypePanelProps, 'onCollapse'>): ReactNode {
  return (
    <>
      <styledEl.Header>
        <styledEl.Heading>
          <Trans>EOA prototype tools</Trans>
        </styledEl.Heading>
        <styledEl.CollapseButton aria-label="Hide prototype tools" onClick={onCollapse}>
          <X size={18} />
        </styledEl.CollapseButton>
      </styledEl.Header>
      <styledEl.Description>
        <Trans>Local-only TWAP simulator for order table, receipt, and proxy-account review.</Trans>
      </styledEl.Description>
      <styledEl.StorageNote>
        <Trans>Rows persist in browser storage until you clear them.</Trans>
      </styledEl.StorageNote>
    </>
  )
}

function PrototypeProxySection({
  proxyAddress,
  hasClaimableFunds,
  hasWithdrawnFunds,
  hasActiveFunds,
  hasWithdrawnActiveFunds,
  activeOrdersCount,
  claimableOrdersCount,
  withdrawnActiveOrdersCount,
  isPending,
  openProxyPage,
  withdrawAllClaimableFunds,
  withdrawAllFunds,
  resetWithdrawnFunds,
  withPendingState,
}: PrototypeProxySectionProps): ReactNode {
  const displayProxyAddress = proxyAddress ? shortenAddress(proxyAddress) : null
  const brokenOrdersCount = hasWithdrawnActiveFunds ? withdrawnActiveOrdersCount : 0

  return (
    <styledEl.Section>
      <styledEl.SectionTitle>
        <Trans>TWAP proxy account</Trans>
      </styledEl.SectionTitle>
      <styledEl.SectionDescription>
        <Trans>
          Inspect the mocked TWAP proxy account, recover claimable funds, or reset withdrawals for another review run.
        </Trans>
      </styledEl.SectionDescription>
      {proxyAddress && (
        <styledEl.ProxyMeta>
          <span>
            <Trans>Proxy</Trans>
          </span>
          <b>{displayProxyAddress}</b>
        </styledEl.ProxyMeta>
      )}
      <PrototypeProxyStats
        activeOrdersCount={activeOrdersCount}
        claimableOrdersCount={claimableOrdersCount}
        brokenOrdersCount={brokenOrdersCount}
      />
      <styledEl.Actions>
        <ButtonSecondary onClick={openProxyPage}>
          <Trans>Go to TWAP proxy account</Trans>
        </ButtonSecondary>
        <ButtonSecondary
          disabled={!hasClaimableFunds || isPending}
          onClick={() => withPendingState(async () => withdrawAllClaimableFunds())}
        >
          <Trans>Withdraw unused funds</Trans>
        </ButtonSecondary>
        <ButtonSecondary
          disabled={!hasActiveFunds || isPending}
          onClick={() => withPendingState(async () => withdrawAllFunds())}
        >
          <Trans>Withdraw all funds</Trans>
        </ButtonSecondary>
        <ButtonSecondary
          disabled={!hasWithdrawnFunds || isPending}
          onClick={() => withPendingState(async () => resetWithdrawnFunds())}
        >
          <Trans>Restore withdrawn funds</Trans>
        </ButtonSecondary>
      </styledEl.Actions>
    </styledEl.Section>
  )
}

function PrototypeProxyStats({
  activeOrdersCount,
  claimableOrdersCount,
  brokenOrdersCount,
}: Pick<PrototypeProxySectionProps, 'activeOrdersCount' | 'claimableOrdersCount'> & {
  brokenOrdersCount: number
}): ReactNode {
  return (
    <styledEl.StatsGrid>
      <styledEl.StatCard>
        <span>
          <Trans>Active</Trans>
        </span>
        <b>{activeOrdersCount}</b>
      </styledEl.StatCard>
      <styledEl.StatCard>
        <span>
          <Trans>Claimable</Trans>
        </span>
        <b>{claimableOrdersCount}</b>
      </styledEl.StatCard>
      <styledEl.StatCard>
        <span>
          <Trans>Broken</Trans>
        </span>
        <b>{brokenOrdersCount}</b>
      </styledEl.StatCard>
    </styledEl.StatsGrid>
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
