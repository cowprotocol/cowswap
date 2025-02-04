import { GtmEvent } from '@cowprotocol/analytics'

export enum WidgetCategory {
  WIDGET_CONFIGURATOR = 'Widget Configurator',
  WIDGET = 'Widget',
}

export type WidgetGtmEvent = GtmEvent<WidgetCategory>
