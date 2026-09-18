const CAMPAIGN_LABELS = new Map<string, string>([['tokens', 'Tokens']])

export type ResourceRouteResolution =
  | { action: 'not-found' }
  | { action: 'redirect'; href: string }
  | { action: 'render' }

export function getCampaignLabel(campaign: string): string {
  const configuredLabel = CAMPAIGN_LABELS.get(campaign)

  if (configuredLabel) {
    return configuredLabel
  }

  return campaign
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getResourcePath(campaign: string, slug: string): string {
  return `/resources/${campaign}/${slug}`
}

export function resolveResourceRoute(
  urlCampaign: string,
  resourceCampaign: string | null | undefined,
  slug: string,
): ResourceRouteResolution {
  if (!resourceCampaign) {
    return { action: 'not-found' }
  }

  if (resourceCampaign !== urlCampaign) {
    return { action: 'redirect', href: getResourcePath(resourceCampaign, slug) }
  }

  return { action: 'render' }
}
