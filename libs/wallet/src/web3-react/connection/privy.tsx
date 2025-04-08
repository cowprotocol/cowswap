import { ButtonPrimary } from '@cowprotocol/ui'

import { useLogin, usePrivy } from '@privy-io/react-auth'

export function PrivyOption() {
  const { authenticated, user} = usePrivy()

  console.log('privy ready ===>', authenticated, user)

  const { login } = useLogin({
    onComplete: () => {
      console.log('login success ===>')
    },
    onError: () => {
      console.log('login error ===>')
    },
  })

  
  return (
    <ButtonPrimary disabled={authenticated} onClick={login}>
      Email or social
    </ButtonPrimary>
  )
}
