import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ABI, getContractConfig } from '../config/contractConfig'
import { shortenAddress, formatTimestamp, getEscrowStateText } from '../utils/contractHelpers'

function History() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (address && publicClient) {
      loadTransactionHistory()
    }
  }, [address, publicClient, chainId])

  const loadTransactionHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const config = getContractConfig(chainId)
      const totalEscrows = await publicClient.readContract({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'escrowCounter'
      })

      const userTransactions = []
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

          const formattedData = {
            id: i,
            buyer: details[0],
            seller: details[1],
            arbitrator: details[2],
            state: parseInt(details[3]),
            description: details[4],
            createdAt: parseInt(details[5]),
            timeout: parseInt(details[6]),
            signatureCount: parseInt(details[7]),
            amount: details[8] || 0n
          }

          // Check if user is participant
          if (formattedData && (
            formattedData.buyer.toLowerCase() === address.toLowerCase() ||
            formattedData.seller.toLowerCase() === address.toLowerCase() ||
            formattedData.arbitrator.toLowerCase() === address.toLowerCase()
          )) {
            userTransactions.push(formattedData)
          }
        } catch (err) {
          console.warn(`Failed to load escrow ${i}:`, err)
        }
      }

      setTransactions(userTransactions.reverse()) // Show newest first
    } catch (err) {
      console.error('Failed to load transaction history:', err)
      setError('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  const getUserRole = (transaction) => {
    if (transaction.buyer.toLowerCase() === address.toLowerCase()) return 'Buyer'
    if (transaction.seller.toLowerCase() === address.toLowerCase()) return 'Seller'
    if (transaction.arbitrator.toLowerCase() === address.toLowerCase()) return 'Arbitrator'
    return 'Observer'
  }

  const getFilteredTransactions = () => {
    switch (filter) {
      case 'completed':
        return transactions.filter(t => t.state === 2)
      case 'active':
        return transactions.filter(t => t.state === 0 || t.state === 1)
      case 'disputes':
        return transactions.filter(t => t.state === 3)
      case 'cancelled':
        return transactions.filter(t => t.state === 4)
      default:
        return transactions
    }
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

  const getStateClass = (state) => {
    return `state-${state}`
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h2>Transaction History</h2>
        </div>
        <div className="loading-spinner">Loading transaction history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h2>Transaction History</h2>
        </div>
        <div className="error-message">{error}</div>
        <button className="btn-retry" onClick={loadTransactionHistory}>
          Retry
        </button>
      </div>
    )
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Transaction History</h2>
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-number">{transactions.length}</span>
            <span className="stat-label">Total Transactions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{transactions.filter(t => t.state === 2).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{transactions.filter(t => t.state === 1).length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({transactions.length})
        </button>
        <button 
          className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('active')}
        >
          Active ({transactions.filter(t => t.state === 0 || t.state === 1).length})
        </button>
        <button 
          className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('completed')}
        >
          Completed ({transactions.filter(t => t.state === 2).length})
        </button>
        <button 
          className={filter === 'disputes' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('disputes')}
        >
          Disputes ({transactions.filter(t => t.state === 3).length})
        </button>
        <button 
          className={filter === 'cancelled' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({transactions.filter(t => t.state === 4).length})
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          {transactions.length === 0 ? (
            <>
              <div className="empty-icon">📋</div>
              <h3>No Transaction History</h3>
              <p>You haven't participated in any escrow transactions yet</p>
            </>
          ) : (
            <>
              <div className="empty-icon">🔍</div>
              <h3>No Matching Transactions</h3>
              <p>No transactions match the current filter</p>
            </>
          )}
        </div>
      ) : (
        <div className="history-table">
          <div className="table-header">
            <div className="col-id">ID</div>
            <div className="col-type">Type</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
            <div className="col-role">Role</div>
            <div className="col-date">Date</div>
            <div className="col-actions">Actions</div>
          </div>
          
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="table-row">
              <div className="col-id">#{transaction.id}</div>
              <div className="col-type">
                <div className="transaction-type">
                  <span className="type-icon">🤝</span>
                  <span>Escrow</span>
                </div>
              </div>
              <div className="col-amount">
                <span className="amount-value">
                  {transaction.amount ? formatEther(transaction.amount) : 'Hidden'} ETH
                </span>
              </div>
              <div className="col-status">
                <div className={`status-badge ${getStateClass(transaction.state)}`}>
                  <span className="status-icon">{getStateIcon(transaction.state)}</span>
                  <span className="status-text">{getEscrowStateText(transaction.state)}</span>
                </div>
              </div>
              <div className="col-role">
                <span className="role-badge">{getUserRole(transaction)}</span>
              </div>
              <div className="col-date">
                <span className="date-text">{formatTimestamp(transaction.createdAt)}</span>
              </div>
              <div className="col-actions">
                <button 
                  className="btn-view-small"
                  onClick={() => {/* Navigate to escrow details */}}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="history-footer">
        <button className="btn-refresh" onClick={loadTransactionHistory}>
          🔄 Refresh History
        </button>
        <div className="pagination-info">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>
    </div>
  )
}

export default History