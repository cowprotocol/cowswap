import { GtmEvent } from '@cowprotocol/analytics'

export enum AnalyticsCategory {
  WIDGET_CONFIGURATOR = 'Widget Configurator',
  WIDGET = 'Widget',
}

export type WidgetGtmEvent = GtmEvent<AnalyticsCategory>
