import { TokenWithLogo } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function useWrappedToken(): TokenWithLogo {
  return getWrappedToken(useNativeCurrency())
}
