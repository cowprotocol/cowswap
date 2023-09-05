import { isProd, isEns, isBarn } from '@cowswap/common-utils'

export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
