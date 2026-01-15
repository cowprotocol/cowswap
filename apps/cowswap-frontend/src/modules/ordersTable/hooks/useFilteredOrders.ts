import { useMemo } from 'react'

import { isOrderFilled } from 'utils/orderUtils/isOrderFilled'
import { isPartiallyFilled } from 'utils/orderUtils/isPartiallyFilled'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrderTableItem } from '../types'
import { getParsedOrderFromTableItem } from '../utils/orderTableGroupUtils'

function filterOnlyFilled(parsedOrder: ParsedOrder, showOnlyFilled: boolean): boolean {
  if (!showOnlyFilled) return true

  return isOrderFilled(parsedOrder) || isPartiallyFilled(parsedOrder)
}

function filterBySymbolExact(parsedOrder: ParsedOrder, searchTermLower: string): boolean {
  const inputToken = parsedOrder.inputToken
  const outputToken = parsedOrder.outputToken

  return [inputToken.symbol, outputToken.symbol].some((symbol) => {
    return symbol?.toLowerCase() === searchTermLower
  })
}

function filterBySymbolPartial(parsedOrder: ParsedOrder, searchTermLower: string): boolean {
  const inputToken = parsedOrder.inputToken
  const outputToken = parsedOrder.outputToken

  // Check for partial symbol matches (case-insensitive)
  return [inputToken.symbol, outputToken.symbol].some((symbol) => {
    return symbol?.toLowerCase().includes(searchTermLower)
  })
}

function filterByAddress(parsedOrder: ParsedOrder, searchTermLower: string): boolean {
  const inputToken = parsedOrder.inputToken
  const outputToken = parsedOrder.outputToken

  // If not a symbol match, check for address matches
  // Clean up the search term but preserve '0x' prefix if present
  const hasPrefix = searchTermLower.startsWith('0x')

  // For exact address matches (40 or 42 chars), do strict comparison
  if (searchTermLower.length === 40 || searchTermLower.length === 42) {
    const searchTermNormalized = hasPrefix ? searchTermLower : `0x${searchTermLower}`
    return [inputToken.address, outputToken.address].some(
      (address) => address.toLowerCase() === searchTermNormalized.toLowerCase(),
    )
  }

  // For partial address matches
  const searchWithoutPrefix = hasPrefix ? searchTermLower.slice(2) : searchTermLower
  if (searchWithoutPrefix.length >= 2) {
    // Only search if we have at least 2 characters
    return [inputToken.address, outputToken.address].some((address) => {
      const addressWithoutPrefix = address.slice(2).toLowerCase()
      return addressWithoutPrefix.includes(searchWithoutPrefix.toLowerCase())
    })
  }

  return false
}

export interface UseFilteredOrdersFilters {
  searchTerm: string
  showOnlyFilled: boolean
}

export function useFilteredOrders(
  orders: OrderTableItem[],
  { searchTerm, showOnlyFilled }: UseFilteredOrdersFilters,
): OrderTableItem[] {
  return useMemo(() => {
    if (!searchTerm && !showOnlyFilled) return orders

    const searchTermLower = searchTerm.toLowerCase().trim()

    // First try exact symbol matches (case-insensitive)
    const exactMatches = orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const displayBasedOnFilled = filterOnlyFilled(parsedOrder, showOnlyFilled)

      return displayBasedOnFilled && filterBySymbolExact(parsedOrder, searchTermLower)
    })

    // If we have exact matches, return those
    if (exactMatches.length > 0) {
      return exactMatches
    }

    // Otherwise, fall back to partial matches and address search
    return orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const displayBasedOnFilled = filterOnlyFilled(parsedOrder, showOnlyFilled)

      if (!displayBasedOnFilled) return false

      const symbolMatch = filterBySymbolPartial(parsedOrder, searchTermLower)

      if (symbolMatch) return true

      return filterByAddress(parsedOrder, searchTermLower)
    })
  }, [orders, searchTerm, showOnlyFilled])
}
