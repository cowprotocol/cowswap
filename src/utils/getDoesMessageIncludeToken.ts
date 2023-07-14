export function getDoesMessageIncludeToken(message: string, tokenAddress: string): string | null {
  if (message.toLowerCase().includes(tokenAddress.toLowerCase())) return tokenAddress

  return null
}
