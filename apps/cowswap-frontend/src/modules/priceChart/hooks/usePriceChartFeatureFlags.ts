export interface PriceChartFeatureFlags {
  isPriceChartEnabled: boolean
}

export function usePriceChartFeatureFlags(): PriceChartFeatureFlags {
  return {
    isPriceChartEnabled: true,
  }
}
