import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useChainId, useWalletClient } from 'wagmi'
import { getContract } from 'viem'
import { CONTRACT_ABI, getContractConfig } from '../config/contractConfig'
import { formatEscrowData, getEscrowStateText, getEscrowStateColor, shortenAddress, formatTimestamp, getTimeRemaining, mockEncrypt } from '../utils/contractHelpers'

function EscrowDetails({ escrowId, onBack }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [escrowData, setEscrowData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loadEscrowDetails()
  }, [escrowId, publicClient])
  
  const loadEscrowDetails = async () => {
    if (!publicClient || !escrowId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const config = getContractConfig(chainId)
      
      const details = await publicClient.readContract({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'getEscrowDetails',
        args: [BigInt(escrowId)]
      })
      
      const formattedData = formatEscrowData(details)
      setEscrowData(formattedData)
      
    } catch (err) {
      console.error('Failed to load escrow details:', err)
      setError('Failed to load escrow details')
    } finally {
      setLoading(false)
    }
  }

  const isParticipant = () => {
    if (!escrowData) return false
    return address === escrowData.buyer || address === escrowData.seller || address === escrowData.arbitrator
  }

  const getUserRole = () => {
    if (!escrowData) return 'observer'
    if (address === escrowData.buyer) return 'buyer'
    if (address === escrowData.seller) return 'seller' 
    if (address === escrowData.arbitrator) return 'arbitrator'
    return 'observer'
  }

  const hasUserSigned = async () => {
    if (!publicClient || !escrowData) return false
    
    try {
      const config = getContractConfig(chainId)
      const hasSigned = await publicClient.readContract({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'hasUserSigned',
        args: [BigInt(escrowId), address]
      })
      return hasSigned
    } catch (error) {
      console.error('Failed to check signature status:', error)
      return false
    }
  }

  const canUserSign = async () => {
    if (!escrowData) return false
    const signed = await hasUserSigned()
    return isParticipant() && escrowData.state === 1 && !signed // 1 = Funded state
  }

  const isTimeoutReached = () => {
    if (!escrowData) return false
    const now = Math.floor(Date.now() / 1000)
    return now > (escrowData.createdAt + escrowData.timeout)
  }

  const handleSignRelease = async () => {
    if (!walletClient || !(await canUserSign())) return

    setIsProcessing(true)
    
    try {
      const config = getContractConfig(chainId)
      const contract = getContract({
        address: config.address,
        abi: CONTRACT_ABI,
        client: walletClient
      })
      
      const approvalData = mockEncrypt(1) // Mock approval = true
      const tx = await contract.write.signApproval([
        BigInt(escrowId),
        approvalData.handle,
        approvalData.proof
      ])
      
      console.log('Sign approval transaction:', tx)
      alert(`Signature transaction sent!\nTx: ${tx}\n\nPlease wait for confirmation...`)
      
      // Reload data after successful transaction
      setTimeout(loadEscrowDetails, 3000)
      
    } catch (error) {
      console.error('Failed to sign approval:', error)
      alert(`Signature failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignRefund = async () => {
    const userRole = getUserRole()
    
    if (userRole !== 'buyer' && userRole !== 'arbitrator') {
      alert('Only buyer and arbitrator can sign refund')
      return
    }

    if (!walletClient || !(await canUserSign())) return

    setIsProcessing(true)

    try {
      const config = getContractConfig(chainId)
      const contract = getContract({
        address: config.address,
        abi: CONTRACT_ABI,
        client: walletClient
      })
      
      const refundReason = mockEncrypt(1) // Mock refund reason
      const tx = await contract.write.requestRefund([
        BigInt(escrowId),
        refundReason.handle,
        refundReason.proof
      ])
      
      console.log('Request refund transaction:', tx)
      alert(`Refund request sent!\nTx: ${tx}\n\nPlease wait for confirmation...`)
      
      setTimeout(loadEscrowDetails, 3000)
      
    } catch (error) {
      console.error('Failed to request refund:', error)
      alert(`Refund request failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEmergencyRefund = async () => {
    if (getUserRole() !== 'buyer') {
      alert('Only buyer can request emergency refund')
      return
    }

    if (!isTimeoutReached()) {
      alert('Timeout not reached, cannot request emergency refund')
      return
    }

    if (!walletClient) return

    setIsProcessing(true)

    try {
      const config = getContractConfig(chainId)
      const contract = getContract({
        address: config.address,
        abi: CONTRACT_ABI,
        client: walletClient
      })
      
      const tx = await contract.write.emergencyRefund([BigInt(escrowId)])
      
      console.log('Emergency refund transaction:', tx)
      alert(`Emergency refund sent!\nTx: ${tx}\n\nPlease wait for confirmation...`)
      
      setTimeout(loadEscrowDetails, 3000)
      
    } catch (error) {
      console.error('Failed to emergency refund:', error)
      alert(`Emergency refund failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeoutDate = () => {
    if (!escrowData) return ''
    const timeoutTimestamp = escrowData.createdAt + escrowData.timeout
    return formatDate(timeoutTimestamp)
  }

  const getStateLabel = (state) => {
    const stateMap = {
      0: 'Created',
      1: 'Funded',
      2: 'Completed',
      3: 'Disputed',
      4: 'Cancelled'
    }
    return stateMap[state] || 'Unknown State'
  }

  const getRoleLabel = (role) => {
    const roleMap = {
      'buyer': 'Buyer',
      'seller': 'Seller',
      'arbitrator': 'Arbitrator',
      'observer': 'Observer'
    }
    return roleMap[role] || role
  }

  if (loading) {
    return (
      <div className="escrow-details">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="escrow-details">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={onBack}>← Back</button>
      </div>
    )
  }

  if (!escrowData) {
    return (
      <div className="escrow-details">
        <div className="error-message">Escrow data not found</div>
        <button className="btn-back" onClick={onBack}>← Back</button>
      </div>
    )
  }

  return (
    <div className="escrow-details">
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to List
        </button>
        <h2>Escrow Transaction Details #{escrowId}</h2>
        <div className={`state-badge state-${escrowData.state}`}>
          {getStateLabel(escrowData.state)}
        </div>
      </div>

      <div className="details-content">
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Transaction Amount</label>
              <value>Encrypted Amount (Privacy Protected)</value>
            </div>
            <div className="info-item">
              <label>Created Time</label>
              <value>{formatDate(escrowData.createdAt)}</value>
            </div>
            <div className="info-item">
              <label>Timeout</label>
              <value>{getTimeoutDate()}</value>
            </div>
            <div className="info-item">
              <label>Your Role</label>
              <value className="role-badge">{getRoleLabel(getUserRole())}</value>
            </div>
          </div>
        </div>

        <div className="description-section">
          <h3>Transaction Description</h3>
          <p className="description-text">{escrowData.description}</p>
        </div>

        <div className="participants-section">
          <h3>Participants Information</h3>
          <div className="participants-list">
            <div className="participant-item">
              <div className="participant-role">Buyer</div>
              <div className="participant-address">{shortenAddress(escrowData.buyer)}</div>
              <div className="participant-status">Encrypted Signature Status</div>
            </div>
            <div className="participant-item">
              <div className="participant-role">Seller</div>
              <div className="participant-address">{shortenAddress(escrowData.seller)}</div>
              <div className="participant-status">Encrypted Signature Status</div>
            </div>
            <div className="participant-item">
              <div className="participant-role">Arbitrator</div>
              <div className="participant-address">{shortenAddress(escrowData.arbitrator)}</div>
              <div className="participant-status">Encrypted Signature Status</div>
            </div>
          </div>
        </div>

        <div className="signature-section">
          <h3>Signature Progress</h3>
          <div className="signature-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(escrowData.signatureCount / 2) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {escrowData.signatureCount}/2 signatures completed (requires 2/3 multisig)
            </div>
          </div>
        </div>

        {escrowData.state === 1 && ( /* Funded state */
          <div className="actions-section">
            <h3>Available Actions</h3>
            <div className="action-buttons">
              {canUserSign() && (
                <>
                  <button 
                    className="btn-release"
                    onClick={handleSignRelease}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Sign Confirm Receipt'}
                  </button>

                  {(getUserRole() === 'buyer' || getUserRole() === 'arbitrator') && (
                    <button 
                      className="btn-refund"
                      onClick={handleSignRefund}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Sign Request Refund'}
                    </button>
                  )}
                </>
              )}

              {getUserRole() === 'buyer' && isTimeoutReached() && (
                <button 
                  className="btn-emergency"
                  onClick={handleEmergencyRefund}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Emergency Refund'}
                </button>
              )}

              {!isParticipant() && (
                <p className="no-actions">You are not a participant in this transaction and cannot perform actions</p>
              )}

              {hasUserSigned() && (
                <p className="already-signed">✅ You have already signed, waiting for other participants</p>
              )}
            </div>
          </div>
        )}

        {escrowData.state === 2 && ( /* Completed state */
          <div className="completed-section">
            <div className="success-message">
              ✅ Transaction completed, funds transferred to seller
            </div>
          </div>
        )}

        {escrowData.state === 4 && ( /* Cancelled state */
          <div className="cancelled-section">
            <div className="cancelled-message">
              ❌ Transaction cancelled, funds refunded to buyer
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EscrowDetails