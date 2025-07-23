import { useState } from 'react'
import { useAccount } from 'wagmi'

function MainInterface() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('create')
  const [amountSlider, setAmountSlider] = useState(2)
  const [customAmount, setCustomAmount] = useState('10000')
  const [selectedToken, setSelectedToken] = useState('USDT')
  const [sellerAddress, setSellerAddress] = useState('')
  const [description, setDescription] = useState('')
  const [escrowId, setEscrowId] = useState('')
  const [action, setAction] = useState('Complete Escrow')

  const amounts = [100, 1000, 10000, 100000, 'custom']

  const mockStats = {
    activeEscrows: 2847,
    recentEscrows: [
      { id: 'ESC2847', time: '2 minutes ago' },
      { id: 'ESC2846', time: '5 minutes ago' },
      { id: 'ESC2845', time: '12 minutes ago' },
      { id: 'ESC2844', time: '18 minutes ago' },
      { id: 'ESC2843', time: '25 minutes ago' },
      { id: 'ESC2842', time: '1 hour ago' },
      { id: 'ESC2841', time: '1 hour ago' },
      { id: 'ESC2840', time: '2 hours ago' }
    ]
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

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const formData = {
      token: selectedToken,
      amount: customAmount,
      seller: sellerAddress,
      description: description
    }
    
    alert(`Escrow creation initiated!\n\nToken: ${formData.token}\nAmount: ${formData.amount}\nSeller: ${formData.seller}\nDescription: ${formData.description}`)
  }

  const handleManageSubmit = (e) => {
    e.preventDefault()
    console.log('Managing escrow:', { escrowId, action })
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
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="DAI">DAI</option>
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
                    <span className="amount-option" onClick={() => setAmount(0)}>100 USDT</span>
                    <span className="amount-option" onClick={() => setAmount(1)}>1k USDT</span>
                    <span className="amount-option" onClick={() => setAmount(2)}>10k USDT</span>
                    <span className="amount-option" onClick={() => setAmount(3)}>100k USDT</span>
                    <span className="amount-option" onClick={() => setAmount(4)}>Custom</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Custom Amount (USDT)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="Enter amount" 
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={amountSlider < 4}
                />
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
                    <span>Platform Arbitrator</span>
                  </div>
                  <span className="signer-role role-arbitrator">ARBITRATOR</span>
                </div>
              </div>
              
              <button type="submit" className="connect-btn">
                Create Escrow
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
                  <option>Request Refund</option>
                  <option>Raise Dispute</option>
                  <option>Check Status</option>
                </select>
              </div>
              
              <button type="submit" className="connect-btn">
                Execute Action
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* Statistics Panel */}
      <div className="stats-panel">
        <div className="stats-header">
          <h3 className="stats-title">Statistics</h3>
          <span className="version-badge">v2.1</span>
        </div>
        
        <div className="anonymity-set">
          <div className="anonymity-header">
            <div className="anonymity-icon"></div>
            <span className="anonymity-text">Active escrows</span>
          </div>
          <div className="anonymity-count">{mockStats.activeEscrows.toLocaleString()} equal escrows</div>
        </div>
        
        <div className="latest-section">
          <h4 className="section-title">Latest escrows</h4>
          <div className="transaction-list">
            {mockStats.recentEscrows.map((escrow) => (
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