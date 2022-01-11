import { useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'components/Button'
import Circle from 'assets/images/blue-loader.svg'
import { CustomLightSpinner, TYPE } from 'theme'
import { CheckAddress, InputField, InputFieldTitle, InputErrorText } from './styled'
import useClaimState from './state'
import { ClaimCommonTypes } from './types'
import useENS from 'hooks/useENS'

type ClaimAddressProps = Pick<ClaimCommonTypes, 'account'> & {
  toggleWalletModal: () => void
}

export default function ClaimAddress({ account, toggleWalletModal }: ClaimAddressProps) {
  const {
    state: { activeClaimAccount, claimConfirmed, inputAddress },
    dispatchers,
  } = useClaimState()

  const { loading, address: resolvedAddress } = useENS(inputAddress)

  // Show input error
  const showInputError = useMemo(
    () => Boolean(inputAddress.length > 0 && !loading && !resolvedAddress),
    [resolvedAddress, inputAddress, loading]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const withoutSpaces = input.replace(/\s+/g, '')

    dispatchers?.setInputAddress(withoutSpaces)
  }

  if (activeClaimAccount || claimConfirmed) return null

  return (
    <CheckAddress>
      <p>
        Enter an address to check for any eligible vCOW claims. <br />
        <i>Note: It is possible to claim for an account, using any wallet/account.</i>
        {!account && (
          <ButtonSecondary onClick={toggleWalletModal}>
            <Trans>or connect a wallet</Trans>
          </ButtonSecondary>
        )}
      </p>

      <InputField>
        <InputFieldTitle>
          <b>Input address</b>
          {loading && <CustomLightSpinner src={Circle} alt="loader" size={'10px'} />}
        </InputFieldTitle>
        <input placeholder="Address or ENS name" value={inputAddress} onChange={handleInputChange} />
      </InputField>

      {showInputError && (
        <InputErrorText>
          <TYPE.error error={true}>
            <Trans>Enter valid token address or ENS</Trans>
          </TYPE.error>
        </InputErrorText>
      )}
    </CheckAddress>
  )
}
