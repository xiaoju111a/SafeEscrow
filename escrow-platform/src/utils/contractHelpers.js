import { parseEther, formatEther } from 'viem'

// Mock FHEVM encryption functions (for development without FHEVM gateway)
export const mockEncrypt = (value) => {
  // Convert BigInt values to string representation
  let valueStr = value.toString()
  if (typeof value === 'bigint') {
    valueStr = value.toString()
  }
  
  // For Sepolia compatibility, use zero-padded values
  // The contract expects bytes32 handle and bytes proof
  const handle = '0x0000000000000000000000000000000000000000000000000000000000000000'
  const proof = '0x00' // Minimal proof for testing
  
  return {
    handle,
    proof
  }
}

// Helper to format escrow data for display
export const formatEscrowData = (rawData) => {
  if (!rawData || rawData.length < 8) return null
  
  return {
    buyer: rawData[0],
    seller: rawData[1], 
    arbitrator: rawData[2],
    state: parseInt(rawData[3]),
    description: rawData[4],
    createdAt: parseInt(rawData[5]),
    timeout: parseInt(rawData[6]),
    signatureCount: parseInt(rawData[7])
  }
}

// Helper to calculate timeout timestamp
export const calculateTimeout = (days) => {
  return days * 24 * 60 * 60 // Convert days to seconds
}

// Helper to check if escrow is expired
export const isEscrowExpired = (createdAt, timeout) => {
  const now = Math.floor(Date.now() / 1000)
  return now > (createdAt + timeout)
}

// Helper to format amounts
export const formatAmount = (amount, decimals = 18) => {
  if (!amount) return '0'
  return formatEther(BigInt(amount))
}

// Helper to parse amounts
export const parseAmount = (amount) => {
  return parseEther(amount.toString())
}

// Helper to get escrow state text
export const getEscrowStateText = (state) => {
  const states = {
    0: 'Created',
    1: 'Funded', 
    2: 'Completed',
    3: 'Disputed',
    4: 'Cancelled'
  }
  return states[state] || 'Unknown'
}

// Helper to get escrow state color
export const getEscrowStateColor = (state) => {
  const colors = {
    0: '#ffa500', // orange - created
    1: '#0066cc', // blue - funded
    2: '#00cc66', // green - completed
    3: '#cc0000', // red - disputed
    4: '#666666'  // gray - cancelled
  }
  return colors[state] || '#666666'
}

// Helper to validate ethereum address
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Helper to shorten address for display
export const shortenAddress = (address) => {
  if (!address || address.length < 10) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Helper to format timestamp
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// Helper to get time remaining
export const getTimeRemaining = (createdAt, timeout) => {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = createdAt + timeout
  const remaining = expiresAt - now
  
  if (remaining <= 0) return 'Expired'
  
  const days = Math.floor(remaining / (24 * 60 * 60))
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((remaining % (60 * 60)) / 60)
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}