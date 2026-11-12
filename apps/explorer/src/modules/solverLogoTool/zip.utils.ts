import { ZipEntry } from './solverLogoTool.types'

const encoder = new TextEncoder()
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
export async function createZip(entries: ZipEntry[], date = new Date()): Promise<Blob> {
  if (entries.length > 100) throw new Error('Too many export files.')
  const local: BlobPart[] = [],
    central: BlobPart[] = []
  let offset = 0,
    centralLength = 0
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const dosDate = ((Math.max(1980, date.getFullYear()) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  for (const entry of entries) {
    validateEntryPath(entry.name)
    const name = encoder.encode(entry.name)
    const data =
      entry.data instanceof Uint8Array
        ? entry.data
        : entry.data instanceof Blob
          ? new Uint8Array(await entry.data.arrayBuffer())
          : encoder.encode(String(entry.data))
    if (data.length > 30 * 1024 * 1024) throw new Error('An export file is too large.')
    const crc = crc32(data)
    const { bytes, view } = header(30)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0x800, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, dosTime, true)
    view.setUint16(12, dosDate, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, data.length, true)
    view.setUint32(22, data.length, true)
    view.setUint16(26, name.length, true)
    local.push(bytes, name, data)
    const c = header(46)
    c.view.setUint32(0, 0x02014b50, true)
    c.view.setUint16(4, 20, true)
    c.view.setUint16(6, 20, true)
    c.view.setUint16(8, 0x800, true)
    c.view.setUint16(10, 0, true)
    c.view.setUint16(12, dosTime, true)
    c.view.setUint16(14, dosDate, true)
    c.view.setUint32(16, crc, true)
    c.view.setUint32(20, data.length, true)
    c.view.setUint32(24, data.length, true)
    c.view.setUint16(28, name.length, true)
    c.view.setUint32(42, offset, true)
    central.push(c.bytes, name)
    centralLength += 46 + name.length
    offset += 30 + name.length + data.length
  }
  const end = header(22)
  end.view.setUint32(0, 0x06054b50, true)
  end.view.setUint16(8, entries.length, true)
  end.view.setUint16(10, entries.length, true)
  end.view.setUint32(12, centralLength, true)
  end.view.setUint32(16, offset, true)
  return new Blob([...local, ...central, end.bytes], { type: 'application/zip' })
}
function header(length: number): { bytes: Uint8Array<ArrayBuffer>; view: DataView } {
  const bytes = new Uint8Array(length)
  return { bytes, view: new DataView(bytes.buffer) }
}

function validateEntryPath(name: string): void {
  if (!name || name.startsWith('/') || name.includes('\\') || name.split('/').includes('..'))
    throw new Error('Invalid export path.')
}
