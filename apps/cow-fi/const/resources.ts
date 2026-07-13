const CAMPAIGN_LABELS: Record<string, string> = {
  tokens: 'Tokens',
}

export function getCampaignLabel(campaign: string): string {
  if (CAMPAIGN_LABELS[campaign]) {
    return CAMPAIGN_LABELS[campaign]
  }

  return campaign
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getResourcePath(campaign: string, slug: string): string {
  return `/resources/${campaign}/${slug}`
}
