import { isProd, isEns, isBarn } from 'legacy/utils/environments'

export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
