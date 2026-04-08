import { CowSwapWidgetParams } from './types'

export const DEFAULT_WIDGET_PARAMS = {
  appCode: 'Unknown',
  /*
  iframeStyle: {
    display: 'block',
    width: '100%',
    minWidth: '420px',
    height: 'auto', // TODO: Before the default was 640px, I think.
    border: '0',
    backgroundColor: 'transparent',
    borderRadius: '1.6rem', // TODO: USe px
  },
  cardStyle: {
    // borderRadius: '24px',
  },
  */
} as const satisfies CowSwapWidgetParams
