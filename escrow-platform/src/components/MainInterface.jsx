import { useState, useEffect } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { getContract, parseEther, formatEther } from 'viem'
import { CONTRACT_ABI, getContractConfig, DEFAULT_ARBITRATOR } from '../config/contractConfig'
import { mockEncrypt, formatEscrowData, calculateTimeout, isValidAddress, shortenAddress } from '../utils/contractHelpers'
import EscrowList from './EscrowList'

function MainInterface() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [activeTab, setActiveTab] = useState('create')
  const [amountSlider, setAmountSlider] = useState(2)
  const [customAmount, setCustomAmount] = useState('0.1')
  const [selectedToken, setSelectedToken] = useState('ETH')
  const [sellerAddress, setSellerAddress] = useState('')
  const [description, setDescription] = useState('')
  const [escrowId, setEscrowId] = useState('')
  const [action, setAction] = useState('Complete Escrow')
  const [isLoading, setIsLoading] = useState(false)
  const [contractStats, setContractStats] = useState({ totalEscrows: 0, recentEscrows: [] })
  const [timeoutDays, setTimeoutDays] = useState(7)

  const amounts = [0.01, 0.1, 1, 10, 'custom']

  // Load contract data on component mount
  useEffect(() => {
    loadContractStats()
  }, [chainId, publicClient])

  const loadContractStats = async () => {
    if (!publicClient) return
    
    try {
      const config = getContractConfig(chainId)
      const contract = getContract({
        address: config.address,
        abi: CONTRACT_ABI,
        client: publicClient
      })
      
      const totalEscrows = await contract.read.escrowCounter()
      
      setContractStats({
        totalEscrows: Number(totalEscrows),
        recentEscrows: Array.from({ length: Math.min(8, Number(totalEscrows)) }, (_, i) => ({
          id: `ESC${Number(totalEscrows) - i}`,
          time: `${i + 1} ${i === 0 ? 'minute' : 'minutes'} ago`
        }))
      })
    } catch (error) {
      console.error('Failed to load contract stats:', error)
    }
  }

  const getContractInstance = () => {
    if (!walletClient) return null
    
    const config = getContractConfig(chainId)
    return getContract({
      address: config.address,
      abi: CONTRACT_ABI,
      client: walletClient
    })
  }

  const updateAmount = (value) => {
    setAmountSlider(value)
    if (value < 4) {
      setCustomAmount(amounts[value].toString())
    }
  }

  const setAmount = (index) => {
    setAmountSlider(index)
    updateAmount(index)
  }

  const getSellerPreview = () => {
    if (sellerAddress) {
      if (sellerAddress.length > 10) {
        return sellerAddress.substring(0, 6) + '...' + sellerAddress.substring(sellerAddress.length - 4)
      }
      return sellerAddress
    }
    return 'Seller Address'
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!walletClient || !isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!isValidAddress(sellerAddress)) {
      alert('Please enter a valid seller address')
      return
    }
    
    if (!customAmount || parseFloat(customAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (!description.trim()) {
      alert('Please enter transaction description')
      return
    }
    
    setIsLoading(true)
    
    try {
      const contract = getContractInstance()
      if (!contract) {
        throw new Error('Failed to get contract instance')
      }
      
      const timeoutSeconds = calculateTimeout(timeoutDays)
      const amount = parseEther(customAmount)
      
      console.log('Creating escrow with:', {
        seller: sellerAddress,
        arbitrator: DEFAULT_ARBITRATOR,
        amount: customAmount + ' ETH',
        description,
        timeout: timeoutDays + ' days'
      })
      
      // Create and fund escrow in one transaction (simplified version)
      const createTx = await contract.write.createEscrow([
        sellerAddress,
        DEFAULT_ARBITRATOR,
        description,
        BigInt(timeoutSeconds)
      ], {
        value: amount, // Send ETH directly
        gas: 300000n
      })
      
      console.log('Create escrow transaction sent:', createTx)
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx })
      console.log('Transaction confirmed:', receipt)
      
      // Extract escrow ID from logs
      let escrowId = 0
      if (receipt.logs && receipt.logs.length > 0) {
        // Find EscrowCreated event log
        const escrowCreatedLog = receipt.logs.find(log => log.topics.length >= 4)
        if (escrowCreatedLog) {
          escrowId = parseInt(escrowCreatedLog.topics[1], 16)
        }
      }
      
      if (!escrowId) {
        // Fallback: get current escrow counter - 1
        const totalEscrows = await contract.read.escrowCounter()
        escrowId = Number(totalEscrows) - 1
      }
      
      alert(`✅ Escrow created successfully!\n\n📋 Escrow ID: ${escrowId}\n💰 Amount: ${customAmount} ETH\n🔗 Transaction Hash: ${createTx}\n\nEscrow created and funded automatically!`)
      
      // Reset form
      setSellerAddress('')
      setDescription('')
      setCustomAmount('0.1')
      
      // Reload stats after successful creation
      setTimeout(loadContractStats, 3000)
      
    } catch (error) {
      console.error('Failed to create escrow:', error)
      alert(`❌ Failed to create escrow: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubmit = async (e) => {
    e.preventDefault()
    
    if (!walletClient || !isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!escrowId || isNaN(escrowId)) {
      alert('Please enter a valid escrow ID')
      return
    }
    
    setIsLoading(true)
    
    try {
      const contract = getContractInstance()
      if (!contract) {
        throw new Error('Failed to get contract instance')
      }
      
      let tx
      
      switch (action) {
        case 'Complete Escrow':
          tx = await contract.write.signApproval([BigInt(escrowId)], {
            gas: 200000n
          })
          break
          
        case 'Raise Dispute':
          tx = await contract.write.disputeEscrow([BigInt(escrowId)], {
            gas: 150000n
          })
          break
          
        case 'Emergency Refund':
          tx = await contract.write.emergencyRefund([BigInt(escrowId)], {
            gas: 150000n
          })
          break
          
        case 'Check Status':
          // This is a read operation
          const config = getContractConfig(chainId)
          const details = await publicClient.readContract({
            address: config.address,
            abi: CONTRACT_ABI,
            functionName: 'getEscrowDetails',
            args: [BigInt(escrowId)]
          })
          
          const stateNames = ['Created', 'Funded', 'Completed', 'Disputed', 'Cancelled']
          const stateName = stateNames[details[3]] || 'Unknown'
          
          alert(`📊 Escrow Status:\n\n🆔 ID: ${escrowId}\n👤 Buyer: ${shortenAddress(details[0])}\n🏪 Seller: ${shortenAddress(details[1])}\n⚖️ Arbitrator: ${shortenAddress(details[2])}\n📈 State: ${stateName}\n💰 Amount: ${formatEther(details[8])} ETH\n✍️ Signatures: ${details[7]}/3\n📝 Description: ${details[4]}`)
          setIsLoading(false)
          return
          
        default:
          throw new Error('Unknown action')
      }
      
      console.log('Transaction sent:', tx)
      alert(`${action} transaction sent!\nTx: ${tx}\n\nPlease wait for confirmation...`)
      
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()}:`, error)
      alert(`Failed to ${action.toLowerCase()}: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="main-container">
      {/* Escrow Panel */}
      <div className="escrow-panel">
        <div className="panel-tabs">
          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create
          </button>
          <button 
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage
          </button>
          <button 
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            My Escrows
          </button>
        </div>
        
        {activeTab === 'create' && (
          <div className="tab-content">
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Token</label>
                <select 
                  className="token-select"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                >
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT (Coming Soon)</option>
                  <option value="USDC">USDC (Coming Soon)</option>
                  <option value="DAI">DAI (Coming Soon)</option>
                </select>
              </div>
              
              <div className="amount-section">
                <label className="form-label">Amount 💰</label>
                <div className="amount-slider-container">
                  <input 
                    type="range" 
                    className="amount-slider" 
                    min="0" 
                    max="4" 
                    step="1" 
                    value={amountSlider}
                    onChange={(e) => updateAmount(parseInt(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #00d2aa 0%, #00d2aa ${(amountSlider / 4) * 100}%, rgba(255,255,255,0.1) ${(amountSlider / 4) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="amount-options">
                    <span className="amount-option" onClick={() => setAmount(0)}>0.01 ETH</span>
                    <span className="amount-option" onClick={() => setAmount(1)}>0.1 ETH</span>
                    <span className="amount-option" onClick={() => setAmount(2)}>1 ETH</span>
                    <span className="amount-option" onClick={() => setAmount(3)}>10 ETH</span>
                    <span className="amount-option" onClick={() => setAmount(4)}>Custom</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount (ETH)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="Enter amount" 
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Timeout (Days)</label>
                <select 
                  className="token-select"
                  value={timeoutDays}
                  onChange={(e) => setTimeoutDays(parseInt(e.target.value))}
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Seller Address</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="0x..." 
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input textarea"
                  placeholder="Describe the terms and conditions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Multi-sig Preview */}
              <div className="multisig-preview">
                <div className="multisig-title">
                  🛡️ 2/3 Multi-Signature Protection
                </div>
                <div className="signer-item">
                  <div className="signer-info">
                    <span>Buyer (You)</span>
                  </div>
                  <span className="signer-role role-buyer">BUYER</span>
                </div>
                <div className="signer-item">
                  <div className="signer-info">
                    <span>{getSellerPreview()}</span>
                  </div>
                  <span className="signer-role role-seller">SELLER</span>
                </div>
                <div className="signer-item">
                  <div className="signer-info">
                    <span>{shortenAddress(DEFAULT_ARBITRATOR)}</span>
                  </div>
                  <span className="signer-role role-arbitrator">ARBITRATOR</span>
                </div>
              </div>
              
              <button type="submit" className="connect-btn" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Escrow'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'manage' && (
          <div className="tab-content">
            <form onSubmit={handleManageSubmit}>
              <div className="form-group">
                <label className="form-label">Escrow ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter escrow ID"
                  value={escrowId}
                  onChange={(e) => setEscrowId(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Action</label>
                <select 
                  className="token-select"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option>Complete Escrow</option>
                  <option>Raise Dispute</option>
                  <option>Emergency Refund</option>
                  <option>Check Status</option>
                </select>
              </div>
              
              <button type="submit" className="connect-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Execute Action'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'list' && (
          <div className="tab-content">
            <EscrowList />
          </div>
        )}
      </div>
      
      {/* Statistics Panel */}
      <div className="stats-panel">
        <div className="stats-header">
          <h3 className="stats-title">Statistics</h3>
          <span className="version-badge">Simple v1.0</span>
          <div className="version-info">✅ Full Featured Version</div>
        </div>
        
        <div className="anonymity-set">
          <div className="anonymity-header">
            <div className="anonymity-icon"></div>
            <span className="anonymity-text">Active escrows</span>
          </div>
          <div className="anonymity-count">{contractStats.totalEscrows.toLocaleString()} total escrows</div>
        </div>
        
        <div className="latest-section">
          <h4 className="section-title">Latest escrows</h4>
          <div className="transaction-list">
            {contractStats.recentEscrows.map((escrow) => (
              <div key={escrow.id} className="transaction-item">
                <span className="tx-id">{escrow.id}</span>
                <span className="tx-time">{escrow.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainInterface