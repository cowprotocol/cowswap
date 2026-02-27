export type RouteSelection = string | string[]
export type ActiveFlowFocus = 'route' | 'cow' | 'amm'

export type RouteHoverHandlers = {
  activeRouteIds?: string[]
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
}

export function getItemOpacity(activeRouteIds: string[] | undefined, routeId: string): number {
  if (!hasActiveRoutes(activeRouteIds)) {
    return 0.98
  }

  return isRouteActive(activeRouteIds, routeId) ? 1 : 0.22
}

export function getPathWidth(activeRouteIds: string[] | undefined, routeId: string, baseWidth: number): number {
  return isRouteActive(activeRouteIds, routeId) ? baseWidth + 1.2 : baseWidth
}

export function isRouteActive(activeRouteIds: string[] | undefined, routeId: string): boolean {
  return !!activeRouteIds?.includes(routeId)
}

export function hasActiveRoutes(activeRouteIds: string[] | undefined): boolean {
  return !!activeRouteIds?.length
}

export function hasRouteOverlap(activeRouteIds: string[] | undefined, routeIds: string[]): boolean {
  if (!hasActiveRoutes(activeRouteIds)) {
    return true
  }

  return routeIds.some((routeId) => isRouteActive(activeRouteIds, routeId))
}
