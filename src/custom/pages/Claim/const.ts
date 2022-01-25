import { isProd, isEns, isBarn } from 'utils/environments'

export const IS_CLAIMING_ENABLED = !isProd && !isEns && !isBarn
