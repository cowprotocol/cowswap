import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export function sanitizeParameters(params: CowSwapWidgetParams) {
  return {
    ...params,
    provider: `<eip-1193 provider>`,
    '//': 'Please contact https://cowprotocol.typeform.com/to/rONXaxHV to enable your partner fee.',
    partnerFeeBips: '50',
  }
}
