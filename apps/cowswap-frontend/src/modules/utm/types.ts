export interface UtmParams {
  // Common UTM parameters (for backwards compatibility and IDE autocompletion)
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  utmCode?: string
  // Allow any other utm_* parameter
  [key: string]: string | undefined
}
