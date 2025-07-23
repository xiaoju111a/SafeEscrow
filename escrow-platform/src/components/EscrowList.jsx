import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ABI, getContractConfig } from '../config/contractConfig'
import { formatEscrowData, getEscrowStateText, shortenAddress, formatTimestamp } from '../utils/contractHelpers'
import EscrowDetails from './EscrowDetails'

function EscrowList() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  
  const [escrows, setEscrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEscrowId, setSelectedEscrowId] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (address && publicClient) {
      loadUserEscrows()
    }
  }, [address, publicClient, chainId])

  const loadUserEscrows = async () => {
    setLoading(true)
    setError(null)

    try {
      const config = getContractConfig(chainId)
      const totalEscrows = await publicClient.readContract({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'escrowCounter'
      })

      const userEscrows = []
      const total = Number(totalEscrows)

      // Load all escrows and filter by user participation
      for (let i = 0; i < total; i++) {
        try {
          const details = await publicClient.readContract({
            address: config.address,
            abi: CONTRACT_ABI,
            functionName: 'getEscrowDetails',
            args: [BigInt(i)]
          })

          // For simple contract, details has different structure
          const formattedData = {
            buyer: details[0],
            seller: details[1],
            arbitrator: details[2],
            state: parseInt(details[3]),
            description: details[4],
            createdAt: parseInt(details[5]),
            timeout: parseInt(details[6]),
            signatureCount: parseInt(details[7]),
            amount: details[8] // New field in simple contract
          }
          if (formattedData && (
            formattedData.buyer.toLowerCase() === address.toLowerCase() ||
            formattedData.seller.toLowerCase() === address.toLowerCase() ||
            formattedData.arbitrator.toLowerCase() === address.toLowerCase()
          )) {
            userEscrows.push({ id: i, ...formattedData })
          }
        } catch (err) {
          console.warn(`Failed to load escrow ${i}:`, err)
        }
      }

      setEscrows(userEscrows.reverse()) // Show newest first
    } catch (err) {
      console.error('Failed to load escrows:', err)
      setError('Failed to load escrows')
    } finally {
      setLoading(false)
    }
  }

  const getStateClass = (state) => {
    return `state-${state}`
  }

  const getUserRole = (escrow) => {
    if (escrow.buyer.toLowerCase() === address.toLowerCase()) return 'Buyer'
    if (escrow.seller.toLowerCase() === address.toLowerCase()) return 'Seller'
    if (escrow.arbitrator.toLowerCase() === address.toLowerCase()) return 'Arbitrator'
    return 'Observer'
  }

  const getFilteredEscrows = () => {
    switch (filter) {
      case 'active':
        return escrows.filter(e => e.state === 0 || e.state === 1)
      case 'completed':
        return escrows.filter(e => e.state === 2)
      case 'all':
      default:
        return escrows
    }
  }

  const isTimeoutReached = (escrow) => {
    const now = Math.floor(Date.now() / 1000)
    return now > (escrow.createdAt + escrow.timeout)
  }

  const getStateIcon = (state) => {
    const icons = {
      0: '📝', // Created
      1: '💰', // Funded
      2: '✅', // Completed
      3: '⚠️', // Disputed
      4: '❌'  // Cancelled
    }
    return icons[state] || '❓'
  }

  if (selectedEscrowId !== null) {
    return (
      <EscrowDetails 
        escrowId={selectedEscrowId} 
        onBack={() => setSelectedEscrowId(null)} 
      />
    )
  }

  if (loading) {
    return (
      <div className="escrow-list">
        <h2>My Escrow Transactions</h2>
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="escrow-list">
        <h2>My Escrow Transactions</h2>
        <div className="error-message">{error}</div>
        <button className="btn-retry" onClick={loadUserEscrows}>
          Retry
        </button>
      </div>
    )
  }

  const filteredEscrows = getFilteredEscrows()

  return (
    <div className="escrow-list">
      <div className="list-header">
        <h2>My Escrow Transactions</h2>
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({escrows.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active ({escrows.filter(e => e.state === 0 || e.state === 1).length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({escrows.filter(e => e.state === 2).length})
          </button>
        </div>
        <button className="btn-refresh" onClick={loadUserEscrows}>
          🔄 Refresh
        </button>
      </div>

      {filteredEscrows.length === 0 ? (
        <div className="empty-state">
          {escrows.length === 0 ? (
            <>
              <p>No escrow transactions</p>
              <p>Create your first escrow to get started</p>
            </>
          ) : (
            <p>No transactions match the filter criteria</p>
          )}
        </div>
      ) : (
        <div className="escrow-grid">
          {filteredEscrows.map((escrow) => (
            <div key={escrow.id} className="escrow-card">
              <div className="card-header">
                <div className="escrow-id">#{escrow.id}</div>
                <div className={`state-badge ${getStateClass(escrow.state)}`}>
                  <span className="state-icon">{getStateIcon(escrow.state)}</span>
                  <span className="state-text">{getEscrowStateText(escrow.state)}</span>
                </div>
              </div>

              <div className="card-content">
                <div className="amount">
                  <span className="label">Amount:</span>
                  <span className="value">{formatEther(escrow.amount)} ETH</span>
                </div>

                <div className="description">
                  <span className="label">Description:</span>
                  <p className="value">{escrow.description}</p>
                </div>

                <div className="participants">
                  <div className="participant">
                    <span className="role">Buyer:</span>
                    <span className="address">{shortenAddress(escrow.buyer)}</span>
                  </div>
                  <div className="participant">
                    <span className="role">Seller:</span>
                    <span className="address">{shortenAddress(escrow.seller)}</span>
                  </div>
                  <div className="participant">
                    <span className="role">Arbitrator:</span>
                    <span className="address">{shortenAddress(escrow.arbitrator)}</span>
                  </div>
                </div>

                <div className="meta-info">
                  <div className="your-role">
                    <span className="label">Your Role:</span>
                    <span className="role-badge">{getUserRole(escrow)}</span>
                  </div>
                  
                  <div className="created-time">
                    <span className="label">Created:</span>
                    <span className="time">{formatTimestamp(escrow.createdAt)}</span>
                  </div>

                  <div className="signature-count">
                    <span className="label">Signatures:</span>
                    <span className="count">{escrow.signatureCount}/3 (requires 2/3)</span>
                  </div>

                  {isTimeoutReached(escrow) && escrow.state === 1 && (
                    <div className="timeout-warning">
                      ⚠️ Timeout reached, buyer can request refund
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-view"
                  onClick={() => setSelectedEscrowId(escrow.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EscrowList