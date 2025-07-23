import { useContract, useWalletClient } from 'wagmi'
import { getContract } from 'viem'
import { CONTRACT_ABI, getContractConfig } from '../config/contractConfig'

// Hook for contract read operations
export const useEscrowContract = (chainId) => {
  const config = getContractConfig(chainId)
  
  return useContract({
    address: config.address,
    abi: CONTRACT_ABI,
  })
}

// Hook for contract write operations
export const useEscrowContractWrite = (chainId) => {
  const { data: walletClient } = useWalletClient()
  const config = getContractConfig(chainId)
  
  if (!walletClient) return null
  
  return getContract({
    address: config.address,
    abi: CONTRACT_ABI,
    client: walletClient
  })
}