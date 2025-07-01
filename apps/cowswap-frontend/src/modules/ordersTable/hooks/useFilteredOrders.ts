import { useMemo } from 'react'

import { OrderTableItem } from '../types'
import { getParsedOrderFromTableItem } from '../utils/orderTableGroupUtils'

export function useFilteredOrders(orders: OrderTableItem[], searchTerm: string): OrderTableItem[] {
  return useMemo(() => {
    if (!searchTerm) return orders

    const searchTermLower = searchTerm.toLowerCase().trim()

    // First try exact symbol matches (case-insensitive)
    const exactMatches = orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const inputToken = parsedOrder.inputToken
      const outputToken = parsedOrder.outputToken

      return [inputToken.symbol, outputToken.symbol].some((symbol) => {
        return symbol?.toLowerCase() === searchTermLower
      })
    })

    // If we have exact matches, return those
    if (exactMatches.length > 0) {
      return exactMatches
    }

    // Otherwise, fall back to partial matches and address search
    return orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const inputToken = parsedOrder.inputToken
      const outputToken = parsedOrder.outputToken

      // Check for partial symbol matches (case-insensitive)
      const symbolMatch = [inputToken.symbol, outputToken.symbol].some((symbol) => {
        return symbol?.toLowerCase().includes(searchTermLower)
      })

      if (symbolMatch) return true

      // If not a symbol match, check for address matches
      // Clean up the search term but preserve '0x' prefix if present
      const hasPrefix = searchTermLower.startsWith('0x')
      const cleanedSearch = searchTermLower.replace(/[^0-9a-fx]/g, '')

      // For exact address matches (40 or 42 chars), do strict comparison
      if (cleanedSearch.length === 40 || cleanedSearch.length === 42) {
        const searchTermNormalized = hasPrefix ? cleanedSearch : `0x${cleanedSearch}`
        return [inputToken.address, outputToken.address].some(
          (address) => address.toLowerCase() === searchTermNormalized.toLowerCase(),
        )
      }

      // For partial address matches
      const searchWithoutPrefix = hasPrefix ? cleanedSearch.slice(2) : cleanedSearch
      if (searchWithoutPrefix.length >= 2) {
        // Only search if we have at least 2 characters
        return [inputToken.address, outputToken.address].some((address) => {
          const addressWithoutPrefix = address.slice(2).toLowerCase()
          return addressWithoutPrefix.includes(searchWithoutPrefix.toLowerCase())
        })
      }

      return false
    })
  }, [orders, searchTerm])
}
