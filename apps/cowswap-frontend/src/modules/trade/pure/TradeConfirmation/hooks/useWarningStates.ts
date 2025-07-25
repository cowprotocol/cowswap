export function useWarningStates(
  recipient: string | null | undefined,
  account: string | undefined,
  ensName: string | undefined,
  isPriceChanged: boolean,
  isPriceStatic: boolean | undefined
): { showRecipientWarning: boolean; showPriceUpdated: boolean } {
  const showRecipientWarning =
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())

  const showPriceUpdated = isPriceChanged && !isPriceStatic

  return { showRecipientWarning: !!showRecipientWarning, showPriceUpdated: !!showPriceUpdated }
}