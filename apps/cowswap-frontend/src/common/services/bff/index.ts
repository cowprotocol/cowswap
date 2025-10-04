import { BFF_BASE_URL } from '@cowprotocol/common-const'

import { CoWBFFClient } from './cowBffClient'

export const coWBFFClient = new CoWBFFClient(BFF_BASE_URL)
