import { EthereumProvider } from '../types'

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export function ProviderMode(init: (ethereum?: EthereumProvider) => void) {
  const injectedProvider = window.ethereum

  const connectedProviderButton = document.getElementById('connectedProviderButton') as HTMLButtonElement
  const standaloneModeButton = document.getElementById('standaloneModeButton') as HTMLButtonElement
  const toggleMode = () => {
    connectedProviderButton.classList.toggle('active')
    standaloneModeButton.classList.toggle('active')
  }

  connectedProviderButton.addEventListener('click', () => {
    init(injectedProvider)
    toggleMode()
  })

  standaloneModeButton.addEventListener('click', () => {
    init()
    toggleMode()
  })

  if (!injectedProvider) {
    toggleMode()
    connectedProviderButton.style.display = 'none'
  } else {
    init(injectedProvider)
  }
}
