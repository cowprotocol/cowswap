import { isProd, isEns, isBarn } from '@cowprotocol/common-utils'

export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
