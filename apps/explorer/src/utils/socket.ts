export function getSocketApiUrl(orderId: string): string {
  return `https://microservices.socket.tech/loki/order?orderId=${encodeURIComponent(orderId)}`
}

/**
 * Socket URL for a transaction.
 */
export function getSocketUrl(txHash: string): string {
  return `https://www.socketscan.io/tx/${encodeURIComponent(txHash)}`
}
