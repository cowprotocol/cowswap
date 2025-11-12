import type { LocaleCatalogLoaders, LocaleCatalogModule } from './i18nActivate'

export const localeCatalogLoaders: LocaleCatalogLoaders =
  import.meta.glob<LocaleCatalogModule>('../locales/*.{po,js}')

export default localeCatalogLoaders
