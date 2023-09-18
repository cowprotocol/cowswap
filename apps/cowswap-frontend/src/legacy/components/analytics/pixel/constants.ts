import { isEns, isProd } from 'legacy/utils/environments'

export const PIXEL_ENABLED = isProd || isEns
