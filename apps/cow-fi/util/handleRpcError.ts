const ERROR_USER_REJECTED = {
  errorMessage: `MEV Blocker was not added. User rejected.`,
  isUserRejection: true,
  isError: false,
}
export const ERROR_ADD_MANUALLY_MESSAGE = {
  errorMessage: 'There was an error adding the RPC automatically to your wallet. Please add manually',
  isUserRejection: false,
  isError: true,
}
const ERROR_NETWORK_ADDING_UNSUPPORTED = {
  errorMessage: `Oh no! 😢 It looks like your wallet doesn't support automatic RPC changes to help protect you. You might be able to make the change manually, though. If you could let your wallet provider know about this, that would be awesome! Thanks for considering it!`,
  isUserRejection: false,
  isError: true,
}
const ERROR_NETWORK_ALREADY_ADDED = {
  errorMessage: `Your wallet has a pending request to add the network. Please review your wallet.`,
  isUserRejection: false,
  isError: true,
}

export function handleRpcError(error: any): {
  errorMessage: string | null
  isUserRejection: boolean
  isError: boolean
} {
  let actualError = error

  // viem wraps the actual error, we need to get the actual error (not their wrapper)

  if (error.details && typeof error.details === 'string') {
    try {
      actualError = JSON.parse(error.details)
    } catch {
      if (error.details === 'Missing or invalid. request() method: wallet_addEthereumChain') {
        return ERROR_NETWORK_ADDING_UNSUPPORTED
      }
    }
  }

  const errorCode = actualError?.code
  if (errorCode === 4001) {
    return ERROR_USER_REJECTED
  }

  // -------- Uncomment to debug
  // if (error) {
  //   return { errorMessage: JSON.stringify(error, null, 2), isUserRejection: false, isError: true }
  // }
  // -----------------

  const message = error?.details.message || error?.message
  if (errorCode === -32002 && message?.includes('already pending')) {
    return ERROR_NETWORK_ALREADY_ADDED
  }

  if (
    errorCode === -32000 &&
    (message?.includes('May not specify default') || // i.e. IOS Metamask (over Wallet Connect)
      message?.includes('Chain ID already exists. Received')) // i.e. Im token
  ) {
    return ERROR_NETWORK_ADDING_UNSUPPORTED
  }

  if (errorCode === -32602 && message?.includes('May not specify default')) {
    // Metakas IOS don't allow you to replace your RPC Endpoint
    // https://community.metamask.io/t/allow-to-add-switch-between-ethereum-networks-using-api/23595
    return ERROR_NETWORK_ADDING_UNSUPPORTED
  }

  return ERROR_ADD_MANUALLY_MESSAGE
}
