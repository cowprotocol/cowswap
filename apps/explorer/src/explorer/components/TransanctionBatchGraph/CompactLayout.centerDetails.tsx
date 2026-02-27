import { getBlockExplorerUrl } from '@cowprotocol/common-utils'

import { type LinkShape, type SankeyModel } from './CompactLayout.model'
import { CowFlowSummary, ExecutionBreakdown, ExecutionHopEndpointKind, SETTLEMENT_RESIDUAL_LABEL } from './types'

import { Network } from '../../../types'
import { abbreviateString } from '../../../utils'

export type CenterDetailsKind = 'cow' | 'route'

export type CenterDetailsValuePart = {
  key: string
  text: string
  href?: string
  endpointKind?: ExecutionHopEndpointKind
}

export type CenterDetailsRow = {
  key: string
  label: string
  value: string
  section?: 'summary' | 'hop'
  valueParts?: CenterDetailsValuePart[]
}

export type CenterDetailsContent = {
  title: string
  tone: CenterDetailsKind
  rows: CenterDetailsRow[]
}

export type ExecutionSourceEndpoint = {
  address: string
  kind: ExecutionHopEndpointKind
  label: string
}

type BuildCenterDetailsContentParams = {
  kind: CenterDetailsKind
  model: SankeyModel
  dexLabel: string
  dexAddress?: string
  cowFlow?: CowFlowSummary
  executionBreakdown?: ExecutionBreakdown
  networkId: Network | undefined
  showUsdValues: boolean
}

export function buildCenterDetailsContent({
  kind,
  model,
  dexLabel,
  dexAddress,
  cowFlow,
  executionBreakdown,
  networkId,
  showUsdValues,
}: BuildCenterDetailsContentParams): CenterDetailsContent {
  return kind === 'cow'
    ? {
        title: 'CoW execution breakdown',
        tone: 'cow',
        rows: getCowRows(model, cowFlow, showUsdValues),
      }
    : {
        title: 'Internal routing breakdown',
        tone: 'route',
        rows: getRouteRows(model, dexLabel, dexAddress, executionBreakdown, networkId),
      }
}

function getCowRows(
  model: SankeyModel,
  cowFlow: CowFlowSummary | undefined,
  showUsdValues: boolean,
): CenterDetailsRow[] {
  const matchedText = cowFlow ? formatMatchedText(cowFlow, showUsdValues) : 'unavailable'
  const savingsText = cowFlow
    ? cowFlow.estimatedLpFeeSavingsUsd > 0
      ? `~${formatUsd(cowFlow.estimatedLpFeeSavingsUsd)}`
      : 'unavailable'
    : 'unavailable'

  return [
    { key: 'matched', label: 'matched', value: matchedText },
    { key: 'providers', label: 'from traders', value: summarizeLabels(model.cowInLinks) },
    { key: 'receivers', label: 'to traders', value: summarizeLabels(model.cowOutLinks) },
    { key: 'savings', label: 'lp savings', value: savingsText },
  ]
}

function getRouteRows(
  model: SankeyModel,
  dexLabel: string,
  dexAddress: string | undefined,
  executionBreakdown: ExecutionBreakdown | undefined,
  networkId: Network | undefined,
): CenterDetailsRow[] {
  if (executionBreakdown && (executionBreakdown.venues.length || executionBreakdown.hops.length)) {
    return getExecutionRows(executionBreakdown, dexLabel, dexAddress, networkId)
  }

  const sourceValue = getRouteSourceValue(dexLabel, dexAddress, networkId)

  return [
    { key: 'source', label: 'liquidity source', ...sourceValue },
    { key: 'sell', label: 'from traders', value: summarizeLabels(model.sellLinks) },
    { key: 'buy', label: 'to traders', value: summarizeLabels(model.buyLinks) },
    { key: 'legs', label: 'legs', value: `${model.sellLinks.length} in / ${model.buyLinks.length} out` },
  ]
}

function getExecutionRows(
  executionBreakdown: ExecutionBreakdown,
  _dexLabel: string,
  _dexAddress: string | undefined,
  networkId: Network | undefined,
): CenterDetailsRow[] {
  const sourceValue = getExecutionSourceValue(executionBreakdown)
  const endpointMix = getEndpointMixLabel(executionBreakdown, { includeSettlement: true })

  const summaryRows: CenterDetailsRow[] = [
    {
      key: 'source',
      label: 'external endpoints (unique)',
      section: 'summary',
      ...sourceValue,
    },
    { key: 'hop-count', label: 'settlement hops', section: 'summary', value: String(executionBreakdown.hops.length) },
  ]

  if (endpointMix !== 'none') {
    summaryRows.push({
      key: 'endpoint-mix',
      label: 'hop endpoint touches',
      section: 'summary',
      value: endpointMix,
    })
  }

  const hopRows = executionBreakdown.hops.map((hop, index) => ({
    key: `hop-${hop.id}`,
    label: `hop ${index + 1}`,
    section: 'hop' as const,
    value: `${hop.fromLabel} -> ${hop.toLabel}: ${hop.amountLabel}`,
    valueParts: getHopValueParts(
      hop.fromLabel,
      hop.fromAddress,
      hop.fromKind,
      hop.toLabel,
      hop.toAddress,
      hop.toKind,
      hop.amountLabel,
      networkId,
    ),
  }))

  return [...summaryRows, ...hopRows]
}

function formatMatchedText(cowFlow: CowFlowSummary, showUsdValues: boolean): string {
  if (!showUsdValues || cowFlow.matchedAmountUsdValue === undefined) {
    return cowFlow.matchedAmountLabel
  }

  return `${cowFlow.matchedAmountLabel} (${formatUsd(cowFlow.matchedAmountUsdValue)})`
}

function summarizeLabels(links: LinkShape[]): string {
  if (!links.length) {
    return 'none'
  }

  const labels = links.map((link) => link.detailsLabel)
  const primary = labels.slice(0, 2).join(' + ')

  if (labels.length <= 2) {
    return primary
  }

  return `${primary} (+${labels.length - 2} more)`
}

function getRouteSourceValue(
  dexLabel: string,
  dexAddress: string | undefined,
  networkId: Network | undefined,
): Pick<CenterDetailsRow, 'value' | 'valueParts'> {
  if (dexLabel === SETTLEMENT_RESIDUAL_LABEL) {
    return { value: 'internal only' }
  }

  if (!dexAddress) {
    return { value: dexLabel }
  }

  return getLabelWithAddressValue(dexLabel, dexAddress, networkId)
}

function getExecutionSourceValue(executionBreakdown: ExecutionBreakdown): Pick<CenterDetailsRow, 'value'> {
  const sources = getExecutionSourceEndpoints(executionBreakdown)

  return {
    value: String(sources.length),
  }
}

export function getExecutionSourceEndpoints(executionBreakdown: ExecutionBreakdown): ExecutionSourceEndpoint[] {
  const endpoints = new Map<string, ExecutionSourceEndpoint>()

  executionBreakdown.venues.forEach((venue) =>
    addExecutionSourceEndpoint(endpoints, venue.address, venue.label, 'venue'),
  )

  executionBreakdown.hops.forEach((hop) => {
    addExecutionSourceEndpoint(endpoints, hop.fromAddress, hop.fromLabel, hop.fromKind)
    addExecutionSourceEndpoint(endpoints, hop.toAddress, hop.toLabel, hop.toKind)
  })

  return Array.from(endpoints.values()).sort((left, right) => left.label.localeCompare(right.label))
}

function addExecutionSourceEndpoint(
  endpoints: Map<string, ExecutionSourceEndpoint>,
  address: string,
  label: string,
  kind: ExecutionHopEndpointKind,
): void {
  if (kind === 'settlement' || kind === 'unknown') {
    return
  }

  const normalizedAddress = address.toLowerCase()
  if (endpoints.has(normalizedAddress)) {
    return
  }

  endpoints.set(normalizedAddress, {
    address: normalizedAddress,
    kind,
    label,
  })
}

function getLabelWithAddressValue(
  label: string,
  address: string,
  networkId: Network | undefined,
): Pick<CenterDetailsRow, 'value' | 'valueParts'> {
  const compactAddress = abbreviateString(address, 8, 6)
  const link = getAddressExplorerLink(networkId, address)

  if (!link) {
    return { value: `${label} · ${compactAddress}` }
  }

  return {
    value: `${label} · ${compactAddress}`,
    valueParts: [
      { key: `${label}-text`, text: label },
      { key: `${label}-divider`, text: ' · ' },
      { key: `${address}-link`, text: compactAddress, href: link },
    ],
  }
}

function getHopValueParts(
  fromLabel: string,
  fromAddress: string,
  fromKind: ExecutionHopEndpointKind,
  toLabel: string,
  toAddress: string,
  toKind: ExecutionHopEndpointKind,
  amountLabel: string,
  networkId: Network | undefined,
): CenterDetailsValuePart[] {
  return [
    toHopEndpointPart('from', fromLabel, fromAddress, fromKind, networkId),
    { key: 'hop-arrow', text: ' -> ' },
    toHopEndpointPart('to', toLabel, toAddress, toKind, networkId),
    { key: 'hop-separator', text: ': ' },
    { key: 'hop-amount', text: amountLabel },
  ]
}

function toHopEndpointPart(
  kind: 'from' | 'to',
  label: string,
  address: string,
  endpointKind: ExecutionHopEndpointKind,
  networkId: Network | undefined,
): CenterDetailsValuePart {
  const href = getAddressExplorerLink(networkId, address)
  const basePart: CenterDetailsValuePart = { key: `${kind}-${address}`, text: label }

  if (href) {
    basePart.href = href
  }

  if (endpointKind !== 'unknown') {
    basePart.endpointKind = endpointKind
  }

  return basePart
}

export function getEndpointMixLabel(
  executionBreakdown: ExecutionBreakdown,
  options?: { includeSettlement?: boolean },
): string {
  const counts = executionBreakdown.hops.reduce(
    (totals, hop) => {
      totals[hop.fromKind] += 1
      totals[hop.toKind] += 1
      return totals
    },
    { settlement: 0, venue: 0, 'special-flow': 0, unknown: 0 } as Record<ExecutionHopEndpointKind, number>,
  )

  const includeSettlement = options?.includeSettlement ?? true
  const labels: string[] = []

  if (includeSettlement && counts.settlement) {
    labels.push(`settlement: ${counts.settlement}`)
  }

  if (counts.venue) {
    labels.push(`external: ${counts.venue}`)
  }

  if (counts['special-flow']) {
    const specialFlowLabel = getSingleSpecialFlowLabel(executionBreakdown)
    labels.push(`${specialFlowLabel || 'special flow'}: ${counts['special-flow']}`)
  }

  if (counts.unknown) {
    labels.push(`unknown: ${counts.unknown}`)
  }

  return labels.length ? labels.join(' · ') : 'none'
}

export function getSingleSpecialFlowLabel(executionBreakdown: ExecutionBreakdown): string | undefined {
  const labels = new Set<string>()

  executionBreakdown.hops.forEach((hop) => {
    if (hop.fromKind === 'special-flow' && hop.fromLabel) {
      labels.add(hop.fromLabel)
    }

    if (hop.toKind === 'special-flow' && hop.toLabel) {
      labels.add(hop.toLabel)
    }
  })

  if (labels.size !== 1) {
    return undefined
  }

  return Array.from(labels)[0]
}

function getAddressExplorerLink(networkId: Network | undefined, address: string): string | undefined {
  if (!networkId || !address) {
    return undefined
  }

  return getBlockExplorerUrl(networkId, 'address', address)
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  }

  if (value >= 1_000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
