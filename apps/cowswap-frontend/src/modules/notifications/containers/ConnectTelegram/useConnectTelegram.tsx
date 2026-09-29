import { useWalletInfo } from '@cowprotocol/wallet'

import { TelegramConnectController, useTelegramConnect } from '../../hooks/useTelegramConnect'

export type ConnectTelegramController = TelegramConnectController

export function useConnectTelegram(isSettingsOpen: boolean): ConnectTelegramController {
  const { account } = useWalletInfo()

  return useTelegramConnect(account, isSettingsOpen)
}
