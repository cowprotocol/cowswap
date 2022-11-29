import JSBI from 'jsbi'

export const isZero = (x: JSBI) => JSBI.equal(x, JSBI.BigInt(0))
