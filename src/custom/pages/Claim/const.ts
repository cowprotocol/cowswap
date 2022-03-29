import { isProd, isEns, isBarn } from 'utils/environments'

export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
