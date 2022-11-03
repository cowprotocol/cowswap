const { Fraction } = require('@uniswap/sdk-core')

function toFraction(value) {
  let [quotient, remainder] = value.split('.')

  if (!remainder) remainder = ''

  // console.log('quotient', quotient)
  // console.log('remainder', remainder)

  const numerator = `${quotient}${remainder}`
  const denominator = `1${'0'.repeat(remainder.length)}`

  // console.log('numerator', numerator)
  // console.log('denominator', denominator)

  const fraction = new Fraction(numerator, denominator)

  return fraction
}

const a = toFraction('11.225')
const b = toFraction('555.23')

console.log(a.remainder)
console.log(a.quotient)
