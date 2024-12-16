import { Order } from 'legacy/state/orders/actions'

export function getIsCustomRecipient({ owner, receiver }: Pick<Order, 'owner' | 'receiver'>): boolean {
  return Boolean(receiver && owner.toLowerCase() !== receiver.toLowerCase())
}
