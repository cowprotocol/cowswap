import { IframeTransport } from '@cowprotocol/iframe-transport'

import { WidgetEventsPayloadMap } from './types'

export const widgetIframeTransport = new IframeTransport<WidgetEventsPayloadMap>('cowSwapWidget')
