const BFF_BASE_URL_STAGING = 'https://bff.barn.cow.fi'

export const BFF_BASE_URL = process.env['REACT_APP_BFF_BASE_URL'] || BFF_BASE_URL_STAGING
export const IS_BFF_STAGING = BFF_BASE_URL === BFF_BASE_URL_STAGING
