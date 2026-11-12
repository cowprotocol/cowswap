import { crc32, createZip } from './zip.utils'

describe('solver ZIP output', () => {
  it('uses the standard CRC32 check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })
  it('rejects traversal and absolute archive paths', async () => {
    await expect(createZip([{ name: '../logo.png', data: 'x' }])).rejects.toThrow('Invalid export path')
    await expect(createZip([{ name: '/logo.png', data: 'x' }])).rejects.toThrow('Invalid export path')
  })
  it('keeps binary source data and UTF-8 filenames', async () => {
    const binary = Uint8Array.of(0, 255, 42, 10, 13)
    const blob = await createZip([{ name: 'solver/é.png', data: binary }])
    const reader = new FileReader()
    const buffer = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = (): void => {
        if (reader.result instanceof ArrayBuffer) resolve(reader.result)
        else reject(new Error('Expected binary ZIP'))
      }
      reader.onerror = (): void => reject(reader.error)
    })
    reader.readAsArrayBuffer(blob)
    const bytes = new Uint8Array(await buffer),
      view = new DataView(bytes.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034b50)
    expect(view.getUint16(6, true)).toBe(0x800)
    const length = view.getUint16(26, true)
    expect(new TextDecoder().decode(bytes.slice(30, 30 + length))).toBe('solver/é.png')
    expect(bytes.slice(30 + length, 30 + length + binary.length)).toEqual(binary)
    expect(view.getUint32(14, true)).toBe(crc32(binary))
  })
})
