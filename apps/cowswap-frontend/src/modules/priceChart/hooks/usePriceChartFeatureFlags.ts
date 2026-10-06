export interface PriceChartFeatureFlags {
  isAdvancedPriceChartEnabled: boolean
  isPriceChartEnabled: boolean
}

export function usePriceChartFeatureFlags(): PriceChartFeatureFlags {
  return {
    isAdvancedPriceChartEnabled: true,
    isPriceChartEnabled: true,
  }
}
