import { getProviderErrorMessage, isRejectRequestProviderError } from 'legacy/utils/misc'

export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
  } else {
    return getProviderErrorMessage(error)
  }
}
