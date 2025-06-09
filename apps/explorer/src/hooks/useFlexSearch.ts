import { useState, useEffect } from 'react'

import IndexModule, { SearchOptions } from 'flexsearch'

const SEARCH_INDEX = new IndexModule.Index({ tokenize: 'forward' })

interface Item {
  id: string
}

export const useFlexSearch = (
  query: string,
  data: Item[],
  filterValues: Array<string>,
  searchOptions?: SearchOptions
): Item[] => {
  const [index, setIndex] = useState(SEARCH_INDEX)
  const [filteredResults, setFilteredResults] = useState<Item[]>(data)

  useEffect(() => {
    data.forEach((el: Item) => {
      const filteredObj = Object.keys(el)
        .filter((key) => filterValues.includes(key))
        .reduce((cur, key) => Object.assign(cur, { [key]: el[key] }), {})
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(index as any).add(el.id, JSON.stringify(filteredObj))
    })
  }, [index, data, filterValues])

  useEffect(() => {
    setIndex(SEARCH_INDEX)
  }, [data])

  useEffect(() => {
    if (!query) return

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (index as any).search(query, searchOptions)
    const filteredResults = data.filter((el: Item) => result.includes(el.id))
    setFilteredResults(filteredResults)
  }, [query, index, searchOptions, data])

  return filteredResults
}
