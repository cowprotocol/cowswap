const data = require('./rinkeby.json')
const fs = require('fs')

const chunk = (claims, size) => {
  const addresses = Object.keys(claims).sort()
  return addresses.reduce((chunks, address, index) => {
    const chunkIndex = Math.floor(index / size)
    if (!chunks[chunkIndex]) chunks[chunkIndex] = {}
    chunks[chunkIndex][address] = claims[address]
    return chunks
  }, [])
}

const chunkIndex = []
chunk(data.claims, 64).forEach((chunk, i) => {
  chunkIndex.push(Object.keys(chunk).sort()[0])
  fs.writeFileSync(`./rinkeby/chunk_${i}.json`, JSON.stringify(chunk, null, 2))
})

fs.writeFileSync(`./rinkeby/index.json`, JSON.stringify(chunkIndex, null, 2))
