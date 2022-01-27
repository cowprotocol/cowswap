import { isProd, isEns, isBarn } from 'utils/environments'

export const IS_CLAIMING_ENABLED = !isProd && !isEns && !isBarn
export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
