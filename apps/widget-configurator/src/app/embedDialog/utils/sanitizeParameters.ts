import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

const PARTNER_FEE_COMMENT = 'Please contact https://cowprotocol.typeform.com/to/rONXaxHV to enable your partner fee.'

export function sanitizeParameters(params: CowSwapWidgetParams): string {
  const sanitizedParams = {
    ...params,
    provider: `<eip-1193 provider>`,
    partnerFeeBips: '50',
  }

  return JSON.stringify(sanitizedParams, null, 4).replace(
    '"partnerFeeBips',
    `// ${PARTNER_FEE_COMMENT}\n    "partnerFeeBips`
  )
}
