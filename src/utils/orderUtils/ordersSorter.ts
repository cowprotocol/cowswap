import { ParsedOrder } from './parseOrder'

export const ordersSorter = (a: ParsedOrder, b: ParsedOrder) => b.creationTime.getTime() - a.creationTime.getTime()
