import { useWeb3React } from '@web3-react/core'
import { useCallback, useState } from 'react'
import { getProfileData } from '@cow/api/gnosisProtocol'
import { ProfileData } from '@cow/api/gnosisProtocol/api'
import { usePolling } from '@cow/common/hooks/usePolling'

type FetchProfileState = {
  profileData: ProfileData | null
  error: string
  isLoading: boolean
}

const emptyState: FetchProfileState = {
  profileData: null,
  error: '',
  isLoading: false,
}

const FETCH_INTERVAL_IN_MINUTES = 5

export default function useFetchProfile(): FetchProfileState {
  const { account, chainId } = useWeb3React()
  const [profile, setProfile] = useState<FetchProfileState>(emptyState)

  const fetchAndSetProfileData = useCallback(async () => {
    console.debug('[useFetchProfile] Fetching profile info')
    try {
      if (chainId && account) {
        setProfile((profile) => ({ ...profile, isLoading: true, error: '' }))
        const profileData = await getProfileData(chainId, account)
        setProfile((profile) => ({ ...profile, isLoading: false, profileData }))
      } else {
        setProfile(emptyState)
      }
    } catch (error) {
      console.error(error)
      setProfile((profile) => ({
        ...profile,
        isLoading: false,
        error: 'There was an error while fetching the profile data',
      }))
    }
  }, [account, chainId])

  usePolling({
    doPolling: fetchAndSetProfileData,
    name: 'useFetchMarketPrice',
    pollingTimeMs: FETCH_INTERVAL_IN_MINUTES * 60_000,
  })

  return profile
}
