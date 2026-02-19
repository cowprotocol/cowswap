import { CompactRoute, CowFlowSummary } from './types'

export const DESKTOP_CHART_WIDTH = 1280
export const MOBILE_CHART_WIDTH = 580
export const DESKTOP_NODE_WIDTH = 260
export const MOBILE_NODE_WIDTH = 160
export const DESKTOP_NODE_HEIGHT = 96
export const MOBILE_NODE_HEIGHT = 84
const DESKTOP_CHART_PADDING = 32
const MOBILE_CHART_PADDING = 24
const DESKTOP_ROW_GAP = 24
const MOBILE_ROW_GAP = 18
const DESKTOP_COW_NODE_HEIGHT = 104
const MOBILE_COW_NODE_HEIGHT = 94
const CENTER_NODE_GAP = 18
const LABEL_FONT_SIZE = 12
const LABEL_HORIZONTAL_PADDING = 4
const LABEL_VERTICAL_PADDING = 2
const LABEL_COLLISION_MARGIN = 4
const LABEL_CHAR_WIDTH = 6.7

export type LinkShape = {
  id: string
  routeId: string
  path: string
  labelX: number
  labelY: number
  width: number
  label: string
  tooltipLabel: string
  sourceY: number
  targetY: number
}

export type SankeyModel = {
  chartWidth: number
  nodeWidth: number
  nodeHeight: number
  chartHeight: number
  leftX: number
  centerX: number
  rightX: number
  routeY: number
  routeHeight: number
  cowY?: number
  cowHeight?: number
  sellLinks: LinkShape[]
  buyLinks: LinkShape[]
  cowInLinks: LinkShape[]
  cowOutLinks: LinkShape[]
  getRowY: (index: number) => number
}

type RouteWithValues = {
  route: CompactRoute
  ammSellValue: number
  ammBuyValue: number
  ammSellUsdValue?: number
  ammBuyUsdValue?: number
}

export function createSankeyModel(
  routes: CompactRoute[],
  cowFlow?: CowFlowSummary,
  showUsdValues = false,
  isMobile = false,
): SankeyModel {
  const config = getLayoutConfig(isMobile)
  const cowMaps = getCowMaps(cowFlow)
  const layout = getBaseLayout(routes.length, !!cowFlow, config)
  const { chartHeight, leftX, centerX, rightX, routeY, routeHeight, cowY, cowHeight, getRowY, nodeWidth, nodeHeight } =
    layout
  const getRouteAnchorY = (index: number): number => routeY + ((index + 1) / (routes.length + 1)) * routeHeight

  const routesWithValues = routes.map((route) => buildRouteWithValues(route, cowMaps))

  const maxFlow = getMaxFlowValue(routesWithValues, cowMaps.providerByRoute, cowMaps.receiverByRoute, showUsdValues)
  const sellLinks = buildSellLinks(
    routesWithValues,
    leftX,
    centerX,
    getRowY,
    getRouteAnchorY,
    maxFlow,
    showUsdValues,
    nodeWidth,
    nodeHeight,
  )
  const buyLinks = buildBuyLinks(
    routesWithValues,
    centerX,
    rightX,
    getRowY,
    getRouteAnchorY,
    maxFlow,
    showUsdValues,
    nodeWidth,
    nodeHeight,
  )
  const { cowInLinks, cowOutLinks } = buildCowLinks({
    cowFlow,
    routes,
    leftX,
    centerX,
    rightX,
    getRowY,
    cowY,
    maxFlow,
    showUsdValues,
    nodeWidth,
    nodeHeight,
    cowNodeHeight: config.cowNodeHeight,
  })
  const alignedLabels = resolveLabelCollisions({
    links: [...sellLinks, ...buyLinks, ...cowInLinks, ...cowOutLinks],
    chartHeight,
    chartPadding: config.chartPadding,
  })
  const applyAlignedLabels = (links: LinkShape[]): LinkShape[] =>
    links.map((link) => ({
      ...link,
      labelY: alignedLabels.get(link.id) ?? link.labelY,
    }))

  return {
    chartWidth: config.chartWidth,
    nodeWidth,
    nodeHeight,
    chartHeight,
    leftX,
    centerX,
    rightX,
    routeY,
    routeHeight,
    cowY,
    cowHeight,
    sellLinks: applyAlignedLabels(sellLinks),
    buyLinks: applyAlignedLabels(buyLinks),
    cowInLinks: applyAlignedLabels(cowInLinks),
    cowOutLinks: applyAlignedLabels(cowOutLinks),
    getRowY,
  }
}

function buildRouteWithValues(route: CompactRoute, cowMaps: CowMaps): RouteWithValues {
  const cowProvider = cowMaps.providerByRoute.get(route.id)
  const cowReceiver = cowMaps.receiverByRoute.get(route.id)
  const cowProviderValue = cowProvider?.amountValue || 0
  const cowReceiverValue = cowReceiver?.amountValue || 0
  const ammSellUsdValue = subtractCowUsd(route.sellAmountUsdValue, cowProvider?.amountUsdValue)
  const ammBuyUsdValue = subtractCowUsd(route.buyAmountUsdValue, cowReceiver?.amountUsdValue)

  return {
    route,
    ammSellValue: Math.max(route.sellAmountValue - cowProviderValue, 0),
    ammBuyValue: Math.max(route.buyAmountValue - cowReceiverValue, 0),
    ammSellUsdValue,
    ammBuyUsdValue,
  }
}

function subtractCowUsd(totalUsd: number | undefined, cowUsd: number | undefined): number | undefined {
  if (totalUsd === undefined) {
    return undefined
  }

  if (cowUsd === undefined) {
    return totalUsd
  }

  return Math.max(totalUsd - cowUsd, 0)
}

type BaseLayout = {
  chartWidth: number
  nodeWidth: number
  nodeHeight: number
  chartHeight: number
  leftX: number
  centerX: number
  rightX: number
  routeY: number
  routeHeight: number
  cowY?: number
  cowHeight?: number
  getRowY: (index: number) => number
}

type LayoutConfig = {
  chartWidth: number
  chartPadding: number
  rowGap: number
  nodeWidth: number
  nodeHeight: number
  cowNodeHeight: number
}

function getLayoutConfig(isMobile: boolean): LayoutConfig {
  if (isMobile) {
    return {
      chartWidth: MOBILE_CHART_WIDTH,
      chartPadding: MOBILE_CHART_PADDING,
      rowGap: MOBILE_ROW_GAP,
      nodeWidth: MOBILE_NODE_WIDTH,
      nodeHeight: MOBILE_NODE_HEIGHT,
      cowNodeHeight: MOBILE_COW_NODE_HEIGHT,
    }
  }

  return {
    chartWidth: DESKTOP_CHART_WIDTH,
    chartPadding: DESKTOP_CHART_PADDING,
    rowGap: DESKTOP_ROW_GAP,
    nodeWidth: DESKTOP_NODE_WIDTH,
    nodeHeight: DESKTOP_NODE_HEIGHT,
    cowNodeHeight: DESKTOP_COW_NODE_HEIGHT,
  }
}

function getBaseLayout(rows: number, hasCow: boolean, config: LayoutConfig): BaseLayout {
  const { chartPadding, chartWidth, nodeHeight, nodeWidth, rowGap, cowNodeHeight } = config
  const rowsHeight = rows * nodeHeight + (rows - 1) * rowGap
  const chartHeight = rowsHeight + chartPadding * 2
  const innerWidth = chartWidth - chartPadding * 2
  const columnGap = Math.max(18, (innerWidth - nodeWidth * 3) / 2)
  const leftX = chartPadding
  const centerX = leftX + nodeWidth + columnGap
  const rightX = centerX + nodeWidth + columnGap
  const routeHeight = Math.max(92, rows * 30 + 24)
  const totalCenterHeight = hasCow ? cowNodeHeight + CENTER_NODE_GAP + routeHeight : routeHeight
  const sellSpanCenter = chartPadding + rowsHeight / 2
  const centerTopY = sellSpanCenter - totalCenterHeight / 2
  const cowY = hasCow ? centerTopY : undefined
  const routeY = hasCow ? centerTopY + cowNodeHeight + CENTER_NODE_GAP : centerTopY

  return {
    chartWidth,
    nodeWidth,
    nodeHeight,
    chartHeight,
    leftX,
    centerX,
    rightX,
    routeY,
    routeHeight,
    cowY,
    cowHeight: hasCow ? cowNodeHeight : undefined,
    getRowY: (index: number): number => chartPadding + index * (nodeHeight + rowGap),
  }
}

type CowMaps = {
  providerByRoute: Map<string, { amountValue: number; amountUsdValue?: number }>
  receiverByRoute: Map<string, { amountValue: number; amountUsdValue?: number }>
}

function getCowMaps(cowFlow: CowFlowSummary | undefined): CowMaps {
  return {
    providerByRoute: new Map(
      cowFlow?.providerAllocations.map((allocation) => [
        allocation.routeId,
        {
          amountValue: allocation.amountValue,
          amountUsdValue: allocation.amountUsdValue,
        },
      ]) || [],
    ),
    receiverByRoute: new Map(
      cowFlow?.receiverAllocations.map((allocation) => [
        allocation.routeId,
        {
          amountValue: allocation.amountValue,
          amountUsdValue: allocation.amountUsdValue,
        },
      ]) || [],
    ),
  }
}

type BuildCowLinksParams = {
  cowFlow?: CowFlowSummary
  routes: CompactRoute[]
  leftX: number
  centerX: number
  rightX: number
  getRowY: (index: number) => number
  cowY?: number
  maxFlow: number
  showUsdValues: boolean
  nodeWidth: number
  nodeHeight: number
  cowNodeHeight: number
}

function buildCowLinks(params: BuildCowLinksParams): { cowInLinks: LinkShape[]; cowOutLinks: LinkShape[] } {
  const {
    cowFlow,
    routes,
    leftX,
    centerX,
    rightX,
    getRowY,
    cowY,
    maxFlow,
    showUsdValues,
    nodeWidth,
    nodeHeight,
    cowNodeHeight,
  } = params
  if (!cowFlow || cowY === undefined) {
    return { cowInLinks: [], cowOutLinks: [] }
  }

  return {
    cowInLinks: buildCowInLinks(
      cowFlow,
      routes,
      leftX,
      centerX,
      getRowY,
      getCowAnchorFactory(cowY, cowNodeHeight, cowFlow.providerAllocations.length),
      maxFlow,
      showUsdValues,
      nodeWidth,
      nodeHeight,
    ),
    cowOutLinks: buildCowOutLinks(
      cowFlow,
      routes,
      centerX,
      rightX,
      getRowY,
      getCowAnchorFactory(cowY, cowNodeHeight, cowFlow.receiverAllocations.length),
      maxFlow,
      showUsdValues,
      nodeWidth,
      nodeHeight,
    ),
  }
}

function buildSellLinks(
  routesWithValues: RouteWithValues[],
  leftX: number,
  centerX: number,
  getRowY: (index: number) => number,
  getRouteAnchorY: (index: number) => number,
  maxFlow: number,
  showUsdValues: boolean,
  nodeWidth: number,
  nodeHeight: number,
): LinkShape[] {
  const links = routesWithValues.reduce<LinkShape[]>((acc, item, index) => {
    if (item.ammSellValue <= 0) return acc

    const startX = leftX + nodeWidth
    const startY = getRowY(index) + nodeHeight / 2
    const endX = centerX
    const endY = getRouteAnchorY(index)

    const displayLabel = flowDisplayLabel(
      item.ammSellValue,
      item.route.sellToken?.symbol,
      item.ammSellUsdValue,
      showUsdValues,
    )

    acc.push({
      id: `sell-link-${item.route.id}`,
      routeId: item.route.id,
      path: buildBezierPath(startX, startY, endX, endY),
      labelX: (startX + endX) / 2,
      labelY: getLabelY(startY, endY),
      width: getFlowWidth(getFlowDisplayValue(item.ammSellValue, item.ammSellUsdValue, showUsdValues), maxFlow),
      label: displayLabel,
      tooltipLabel: flowTooltipLabel(displayLabel, item.route.sellAmountLabel, item.ammSellUsdValue, showUsdValues),
      sourceY: startY,
      targetY: endY,
    })

    return acc
  }, [])

  return links.sort((a, b) => a.targetY - b.targetY)
}

function buildBuyLinks(
  routesWithValues: RouteWithValues[],
  centerX: number,
  rightX: number,
  getRowY: (index: number) => number,
  getRouteAnchorY: (index: number) => number,
  maxFlow: number,
  showUsdValues: boolean,
  nodeWidth: number,
  nodeHeight: number,
): LinkShape[] {
  const links = routesWithValues.reduce<LinkShape[]>((acc, item, index) => {
    if (item.ammBuyValue <= 0) return acc

    const startX = centerX + nodeWidth
    const startY = getRouteAnchorY(index)
    const endX = rightX
    const endY = getRowY(index) + nodeHeight / 2
    const displayLabel = flowDisplayLabel(
      item.ammBuyValue,
      item.route.buyToken?.symbol,
      item.ammBuyUsdValue,
      showUsdValues,
    )

    acc.push({
      id: `buy-link-${item.route.id}`,
      routeId: item.route.id,
      path: buildBezierPath(startX, startY, endX, endY),
      labelX: (startX + endX) / 2,
      labelY: getLabelY(startY, endY),
      width: getFlowWidth(getFlowDisplayValue(item.ammBuyValue, item.ammBuyUsdValue, showUsdValues), maxFlow),
      label: displayLabel,
      tooltipLabel: flowTooltipLabel(displayLabel, item.route.buyAmountLabel, item.ammBuyUsdValue, showUsdValues),
      sourceY: startY,
      targetY: endY,
    })

    return acc
  }, [])

  return links.sort((a, b) => a.targetY - b.targetY)
}

function buildCowInLinks(
  cowFlow: CowFlowSummary,
  routes: CompactRoute[],
  leftX: number,
  centerX: number,
  getRowY: (index: number) => number,
  getCowAnchorY: (index: number) => number,
  maxFlow: number,
  showUsdValues: boolean,
  nodeWidth: number,
  nodeHeight: number,
): LinkShape[] {
  const allocations = [...cowFlow.providerAllocations].sort((allocationA, allocationB) => {
    const routeIndexA = routes.findIndex((route) => route.id === allocationA.routeId)
    const routeIndexB = routes.findIndex((route) => route.id === allocationB.routeId)
    return routeIndexA - routeIndexB
  })

  const links = allocations.reduce<LinkShape[]>((acc, allocation, index) => {
    const routeIndex = routes.findIndex((route) => route.id === allocation.routeId)
    if (routeIndex === -1 || allocation.amountValue <= 0) return acc

    const startX = leftX + nodeWidth
    const startY = getRowY(routeIndex) + nodeHeight / 2
    const endX = centerX
    const endY = getCowAnchorY(index)
    const label = flowDisplayLabel(
      allocation.amountValue,
      cowFlow.tokenSymbol,
      allocation.amountUsdValue,
      showUsdValues,
    )

    acc.push({
      id: `cow-in-${allocation.routeId}`,
      routeId: allocation.routeId,
      path: buildBezierPath(startX, startY, endX, endY),
      labelX: (startX + endX) / 2,
      labelY: getLabelY(startY, endY),
      width: getFlowWidth(
        getFlowDisplayValue(allocation.amountValue, allocation.amountUsdValue, showUsdValues),
        maxFlow,
      ),
      label,
      tooltipLabel:
        showUsdValues && allocation.amountUsdValue
          ? `${allocation.amountLabel} (${formatUsd(allocation.amountUsdValue)})`
          : allocation.amountLabel,
      sourceY: startY,
      targetY: endY,
    })

    return acc
  }, [])

  return links.sort((a, b) => a.targetY - b.targetY)
}

function buildCowOutLinks(
  cowFlow: CowFlowSummary,
  routes: CompactRoute[],
  centerX: number,
  rightX: number,
  getRowY: (index: number) => number,
  getCowAnchorY: (index: number) => number,
  maxFlow: number,
  showUsdValues: boolean,
  nodeWidth: number,
  nodeHeight: number,
): LinkShape[] {
  const allocations = [...cowFlow.receiverAllocations].sort((allocationA, allocationB) => {
    const routeIndexA = routes.findIndex((route) => route.id === allocationA.routeId)
    const routeIndexB = routes.findIndex((route) => route.id === allocationB.routeId)
    return routeIndexA - routeIndexB
  })

  const links = allocations.reduce<LinkShape[]>((acc, allocation, index) => {
    const routeIndex = routes.findIndex((route) => route.id === allocation.routeId)
    if (routeIndex === -1 || allocation.amountValue <= 0) return acc

    const startX = centerX + nodeWidth
    const startY = getCowAnchorY(index)
    const endX = rightX
    const endY = getRowY(routeIndex) + nodeHeight / 2
    const label = flowDisplayLabel(
      allocation.amountValue,
      cowFlow.tokenSymbol,
      allocation.amountUsdValue,
      showUsdValues,
    )

    acc.push({
      id: `cow-out-${allocation.routeId}`,
      routeId: allocation.routeId,
      path: buildBezierPath(startX, startY, endX, endY),
      labelX: (startX + endX) / 2,
      labelY: getLabelY(startY, endY),
      width: getFlowWidth(
        getFlowDisplayValue(allocation.amountValue, allocation.amountUsdValue, showUsdValues),
        maxFlow,
      ),
      label,
      tooltipLabel:
        showUsdValues && allocation.amountUsdValue
          ? `${allocation.amountLabel} (${formatUsd(allocation.amountUsdValue)})`
          : allocation.amountLabel,
      sourceY: startY,
      targetY: endY,
    })

    return acc
  }, [])

  return links.sort((a, b) => a.targetY - b.targetY)
}

function getCowAnchorFactory(startY: number, height: number, count: number): (index: number) => number {
  return (index: number): number => {
    if (count <= 0) return startY + height / 2

    return startY + ((index + 1) / (count + 1)) * height
  }
}

function getMaxFlowValue(
  routesWithValues: RouteWithValues[],
  providerByRoute: Map<string, { amountValue: number; amountUsdValue?: number }>,
  receiverByRoute: Map<string, { amountValue: number; amountUsdValue?: number }>,
  showUsdValues: boolean,
): number {
  const values: number[] = []

  routesWithValues.forEach((item) => {
    values.push(getFlowDisplayValue(item.ammSellValue, item.ammSellUsdValue, showUsdValues))
    values.push(getFlowDisplayValue(item.ammBuyValue, item.ammBuyUsdValue, showUsdValues))
    values.push(
      getFlowDisplayValue(
        providerByRoute.get(item.route.id)?.amountValue || 0,
        providerByRoute.get(item.route.id)?.amountUsdValue,
        showUsdValues,
      ),
    )
    values.push(
      getFlowDisplayValue(
        receiverByRoute.get(item.route.id)?.amountValue || 0,
        receiverByRoute.get(item.route.id)?.amountUsdValue,
        showUsdValues,
      ),
    )
  })

  return Math.max(...values, 0)
}

function flowDisplayLabel(
  value: number,
  symbol: string | undefined,
  usdValue: number | undefined,
  showUsdValues: boolean,
): string {
  const fallbackSymbol = symbol || '?'
  if (value <= 0) {
    return `0 ${fallbackSymbol}`
  }

  const tokenLabel = `${formatTokenValue(value)} ${fallbackSymbol}`
  if (showUsdValues && usdValue) {
    return `${tokenLabel} (${formatUsd(usdValue)})`
  }

  return tokenLabel
}

function flowTooltipLabel(
  label: string,
  fallbackLabel: string,
  usdValue: number | undefined,
  showUsdValues: boolean,
): string {
  if (!showUsdValues || usdValue === undefined) {
    return fallbackLabel
  }

  return `${fallbackLabel} (${formatUsd(usdValue)})`
}

function formatTokenValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
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

function getFlowDisplayValue(value: number, usdValue: number | undefined, showUsdValues: boolean): number {
  return showUsdValues && usdValue ? usdValue : value
}

function buildBezierPath(startX: number, startY: number, endX: number, endY: number): string {
  const horizontalDistance = endX - startX
  const firstControlPointX = startX + horizontalDistance * 0.33
  const secondControlPointX = startX + horizontalDistance * 0.66

  return `M ${startX} ${startY} C ${firstControlPointX} ${startY}, ${secondControlPointX} ${endY}, ${endX} ${endY}`
}

function getLabelY(startY: number, endY: number): number {
  const midpoint = (startY + endY) / 2
  const directionOffset = endY >= startY ? -10 : 12

  return midpoint + directionOffset
}

function getFlowWidth(value: number, maxValue: number): number {
  const MIN_WIDTH = 3
  const MAX_WIDTH = 40

  if (!maxValue || value <= 0) return MIN_WIDTH

  const ratio = value / maxValue

  return MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * ratio
}

type ResolveLabelCollisionsParams = {
  links: LinkShape[]
  chartHeight: number
  chartPadding: number
}

function resolveLabelCollisions(params: ResolveLabelCollisionsParams): Map<string, number> {
  const { links, chartHeight, chartPadding } = params
  const placements = links
    .map((link) => ({
      id: link.id,
      x: link.labelX,
      y: link.labelY,
      width: estimateLabelWidth(link.label),
      height: estimateLabelHeight(),
    }))
    .sort((left, right) => (left.x === right.x ? left.y - right.y : left.x - right.x))

  const resolved: Array<{ id: string; x: number; y: number; width: number; height: number }> = []

  placements.forEach((placement) => {
    let nextY = placement.y
    let hasCollision = true
    let guard = 0

    while (hasCollision && guard < 32) {
      hasCollision = false
      guard += 1

      for (const placed of resolved) {
        const intersectsHorizontally =
          Math.abs(nextY - placed.y) < (placement.height + placed.height) / 2 + LABEL_COLLISION_MARGIN &&
          Math.abs(placement.x - placed.x) < (placement.width + placed.width) / 2

        if (intersectsHorizontally) {
          nextY = placed.y + (placement.height + placed.height) / 2 + LABEL_COLLISION_MARGIN
          hasCollision = true
        }
      }
    }

    const clampedY = clamp(
      nextY,
      chartPadding + placement.height / 2,
      chartHeight - chartPadding - placement.height / 2,
    )

    resolved.push({
      ...placement,
      y: clampedY,
    })
  })

  return new Map(resolved.map((placement) => [placement.id, placement.y]))
}

function estimateLabelWidth(label: string): number {
  return label.length * LABEL_CHAR_WIDTH + LABEL_HORIZONTAL_PADDING * 2
}

function estimateLabelHeight(): number {
  return LABEL_FONT_SIZE + LABEL_VERTICAL_PADDING * 2
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
