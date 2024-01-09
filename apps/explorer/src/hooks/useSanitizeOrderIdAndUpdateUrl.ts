import { useHistory, useParams, useRouteMatch } from 'react-router'

export function useOrderIdParam(): string {
  const { orderId } = useParams<{ orderId: string }>()

  return orderId
}

/**
 * Fetches order id from url parameters
 * Sanitizes it and updates the URL, if any
 *
 * @returns Sanitized order id
 */
export function useSanitizeOrderIdAndUpdateUrl(): string {
  const orderId = useOrderIdParam()
  const { url } = useRouteMatch()
  const history = useHistory()

  // Allows any kind of crap in the orderId, as long as there is a valid and continuous order id in it
  // Ignores case
  // 0x prefix is optional
  const regexMatch = orderId.match(/(:?0x)?([0-9a-f]{112})/i)

  // Get extracted order id from the match, if any
  const sanitizedOrderId = (regexMatch && regexMatch[0]?.toLowerCase()) || orderId.toLowerCase()

  // If there's an orderId in the url AND it's not yet nice, update the URL
  if (regexMatch && sanitizedOrderId !== orderId) {
    // TODO: is there a better way to do this?
    const newPath = url.replace(orderId, sanitizedOrderId)
    history.push(newPath)
  }

  return sanitizedOrderId
}
