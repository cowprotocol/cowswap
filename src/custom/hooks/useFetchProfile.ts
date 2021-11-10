import { useActiveWeb3React } from 'hooks/web3'
import { useEffect, useState } from 'react'
import { getProfileData } from 'api/gnosisProtocol'
import { ProfileData } from 'api/gnosisProtocol/api'

export default function useFetchProfile() {
  const { account, chainId } = useActiveWeb3React()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    async function fetchAndSetProfileData() {
      if (chainId && account) {
        const profileData = await getProfileData(chainId, account).catch((error) => {
          console.error('Error getting profile data:', error)
          return null
        })

        setProfileData(profileData)
      } else {
        setProfileData(null)
      }
    }

    fetchAndSetProfileData()
  }, [account, chainId])

  return profileData
}
