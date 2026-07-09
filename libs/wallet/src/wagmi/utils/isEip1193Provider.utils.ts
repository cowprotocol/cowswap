import { EIP1193Provider } from 'viem'

export function isEip1193Provider(provider: unknown): provider is EIP1193Provider {
  if (typeof provider !== 'object' || provider === null) {
    return false
  }

  return (
    typeof (provider as EIP1193Provider).request === 'function' &&
    typeof (provider as EIP1193Provider).on === 'function' &&
    typeof (provider as EIP1193Provider).removeListener === 'function'
  )
}
