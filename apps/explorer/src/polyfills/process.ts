type ProcessShim = {
  on?: (...args: unknown[]) => void
  once?: (...args: unknown[]) => void
  off?: (...args: unknown[]) => void
  addListener?: (...args: unknown[]) => void
  removeListener?: (...args: unknown[]) => void
  removeAllListeners?: (...args: unknown[]) => void
  emit?: (...args: unknown[]) => void
}

const globalRef = globalThis as typeof globalThis & { process?: ProcessShim }
const existingProcess = globalRef.process

if (!existingProcess || typeof existingProcess.on !== 'function') {
  const noop = (): void => {}
  const shim: ProcessShim = existingProcess ?? {}
  shim.on = noop
  shim.once = noop
  shim.off = noop
  shim.addListener = noop
  shim.removeListener = noop
  shim.removeAllListeners = noop
  shim.emit = noop
  Object.defineProperty(globalThis, 'process', {
    value: shim,
    configurable: true,
    writable: true,
  })
}
