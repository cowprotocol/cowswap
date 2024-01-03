import { useState, useEffect } from 'react'
import { Index, SearchOptions } from 'flexsearch'

const SEARCH_INDEX = new Index({
  tokenize: 'forward',
})

interface Item {
  id: string
}

export const useFlexSearch = (
  query: string,
  data: Item[],
  filterValues: Array<string>,
  searchOptions?: SearchOptions,
): Item[] => {
  const [index, setIndex] = useState(SEARCH_INDEX)
  const [filteredResults, setFilteredResults] = useState<Item[]>(data)

  useEffect(() => {
    data.forEach((el: Item) => {
      const filteredObj = Object.keys(el)
        .filter((key) => filterValues.includes(key))
        .reduce((cur, key) => Object.assign(cur, { [key]: el[key] }), {})
      index.add(el.id, JSON.stringify(filteredObj))
    })
  }, [index, data, filterValues])

  useEffect(() => {
    setIndex(SEARCH_INDEX)
  }, [data])

  useEffect(() => {
    if (!query) return

    const result = index.search(query, searchOptions)
    const filteredResults = data.filter((el: Item) => result.includes(el.id))
    setFilteredResults(filteredResults)
  }, [query, index, searchOptions, data])

  return filteredResults
}
