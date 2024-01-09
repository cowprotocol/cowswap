import { useMemo } from 'react'
import useSafeState from './useSafeState'

interface SortTopic<K extends string> {
  topic: K
  asc: boolean
}

type CustomSortComparator<T, K> = (topic: K, asc: boolean) => (lhs: T, rhs: T) => number

function useSortByTopic<T, K extends string>(
  data: T[],
  defaultTopic: K,
  compareFnFactory: CustomSortComparator<T, K>,
  initialSort?: 'asc' | 'desc',
): { sortedData: T[]; sortTopic: SortTopic<K>; setSortTopic: React.Dispatch<React.SetStateAction<SortTopic<K>>> } {
  // true == 'asc' && false == 'dsc'
  const [sortTopic, setSortTopic] = useSafeState<SortTopic<K>>({
    topic: defaultTopic,
    asc: !initialSort || initialSort === 'asc',
  })
  const [sortedData, setSortedData] = useSafeState<T[]>(data)

  const { asc, topic } = sortTopic

  useMemo(() => {
    if (topic) {
      // make a copy as not to mutate
      const dataCopy = data.slice(0)

      const compareFn = compareFnFactory(topic, asc)

      // Sort the data
      dataCopy.sort(compareFn)

      return setSortedData(dataCopy)
    }
  }, [compareFnFactory, data, asc, setSortedData, topic])

  return { sortedData, sortTopic, setSortTopic }
}

export default useSortByTopic
