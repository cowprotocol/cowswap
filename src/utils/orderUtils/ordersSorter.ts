import { ParsedOrder } from './parseOrder'

export const ordersSorter = (a: ParsedOrder, b: ParsedOrder) =>
  b.parsedCreationTime.getTime() - a.parsedCreationTime.getTime()
