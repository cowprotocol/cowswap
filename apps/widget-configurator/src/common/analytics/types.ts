import { GtmEvent } from '@cowprotocol/analytics'

export type WidgetGtmEvent = GtmEvent<AnalyticsCategory>

export enum AnalyticsCategory {
  WIDGET_CONFIGURATOR = 'Widget Configurator',
  WIDGET = 'Widget',
}
