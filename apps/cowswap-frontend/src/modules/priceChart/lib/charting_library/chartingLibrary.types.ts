export type ResolutionString = string

export interface Bar {
  close: number
  high: number
  low: number
  open: number
  time: number
  volume?: number
}

export interface LibrarySymbolInfo {
  data_status: string
  description: string
  exchange: string
  format: string
  has_daily: boolean
  has_intraday: boolean
  has_weekly_and_monthly: boolean
  listed_exchange: string
  minmov: number
  name: string
  pricescale: number
  session: string
  supported_resolutions: ResolutionString[]
  ticker?: string
  timezone: string
  type: string
  visible_plots_set: string
  volume_precision: number
}

export interface SearchSymbolResultItem {
  description: string
  exchange: string
  symbol: string
  ticker?: string
  type: string
}

export type SearchSymbolsCallback = (items: SearchSymbolResultItem[]) => void
export type OnReadyCallback = (configuration: DatafeedConfiguration) => void

export interface DatafeedConfiguration {
  exchanges: {
    desc: string
    name: string
    value: string
  }[]
  supported_resolutions: ResolutionString[]
  supports_time: boolean
}

interface PeriodParams {
  countBack: number
  firstDataRequest: boolean
  from: number
  to: number
}

type HistoryCallback = (bars: Bar[], metadata: { nextTime?: number; noData: boolean }) => void
type ErrorCallback = (reason: string) => void

export interface IBasicDataFeed {
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ): void
  onReady(callback: OnReadyCallback): void
  resolveSymbol(symbolName: string, onResolve: (symbol: LibrarySymbolInfo) => void, onError: ErrorCallback): void
  searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback): void
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUid: string,
    onResetCacheNeededCallback: () => void,
  ): void
  unsubscribeBars(subscriberUid: string): void
}

export type ChartPropertiesOverrides = Record<string, string | number | boolean>

export interface CustomFormatters {
  priceFormatterFactory?: () => {
    format(value: number): string
  }
}

interface TimeFrame {
  description: string
  resolution: ResolutionString
  text: string
}

interface ChartingLibraryWidgetOptions {
  auto_save_delay?: number
  autosize: boolean
  container: string
  custom_css_url?: string
  custom_formatters?: CustomFormatters
  datafeed: IBasicDataFeed
  disabled_features?: string[]
  enabled_features?: string[]
  favorites?: {
    chartTypes: string[]
    intervals: ResolutionString[]
  }
  interval: ResolutionString
  library_path: string
  loading_screen?: {
    backgroundColor: string
    foregroundColor: string
  }
  locale?: string
  overrides?: Partial<ChartPropertiesOverrides>
  saved_data?: object
  symbol: string
  theme?: 'dark' | 'light'
  time_frames?: TimeFrame[]
  timezone?: string
}

interface ChartShapePoint {
  price: number
  time: number
}

interface ChartShapeOptions {
  disableSave?: boolean
  disableSelection?: boolean
  disableUndo?: boolean
  lock?: boolean
  overrides?: Record<string, string | number | boolean>
  shape: string
  showInObjectsTree?: boolean
  text?: string
  zOrder?: string
}

interface ChartApi {
  createShape(point: ChartShapePoint, options: ChartShapeOptions): Promise<string>
  createStudy(name: string, forceOverlay: boolean, lock: boolean): Promise<string>
  crossHairMoved(): {
    subscribe(owner: object | null, callback: (event: { price: number }) => void): void
    unsubscribe(owner: object | null, callback: (event: { price: number }) => void): void
  }
  getAllStudies(): { id: string; name: string }[]
  removeEntity(id: string, options?: { disableUndo?: boolean }): void
  setSymbol(symbol: string, callback: () => void): void
  symbol(): string
}

export interface IChartingLibraryWidget {
  activeChart(): ChartApi
  applyOverrides(overrides: Partial<ChartPropertiesOverrides>): void
  changeTheme(theme: 'dark' | 'light'): Promise<void>
  onChartReady(callback: () => void): void
  remove(): void
  save(callback: (state: object) => void): void
  subscribe(event: 'mouse_up' | 'onAutoSaveNeeded', callback: () => void): void
  unsubscribe(event: 'mouse_up' | 'onAutoSaveNeeded', callback: () => void): void
}

export interface ChartingLibraryWidgetConstructor {
  new (options: ChartingLibraryWidgetOptions): IChartingLibraryWidget
}
