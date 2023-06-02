import { ParsedOrder } from './parseOrder'

export const ordersSorter = (a: ParsedOrder, b: ParsedOrder) => Date.parse(b.creationTime) - Date.parse(a.creationTime)
