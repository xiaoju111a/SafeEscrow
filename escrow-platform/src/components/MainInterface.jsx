import { useState } from 'react'
import { useAccount } from 'wagmi'

function MainInterface() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('deposit')
  const [amount, setAmount] = useState('0.1')
  const [selectedToken, setSelectedToken] = useState('ETH')
  const [recipient, setRecipient] = useState('')
  const [arbitrator, setArbitrator] = useState('')

  const amounts = ['0.1', '1', '10', '100']

  const mockStats = {
    anonymitySet: 37570,
    totalDeposits: 37570,
    recentDeposits: [
      { id: '37570', time: '2 hours ago' },
      { id: '37565', time: '4 hours ago' },
      { id: '37569', time: '2 hours ago' },
      { id: '37564', time: '4 hours ago' },
      { id: '37568', time: '4 hours ago' },
      { id: '37563', time: '4 hours ago' },
      { id: '37567', time: '4 hours ago' },
      { id: '37562', time: '4 hours ago' },
      { id: '37566', time: '4 hours ago' },
      { id: '37561', time: '4 hours ago' }
    ]
  }

  const handleConnect = () => {
    // WalletConnect will handle this
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Submitting:', { activeTab, amount, selectedToken, recipient, arbitrator })
  }

  return (
    <div className="main-interface">
      <div className="interface-container">
        {/* Left Panel - Transaction Form */}
        <div className="transaction-panel">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </button>
            <button 
              className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
          </div>

          {/* Transaction Form */}
          <form className="transaction-form" onSubmit={handleSubmit}>
            {/* Token Selection */}
            <div className="form-group">
              <label>Token</label>
              <select 
                value={selectedToken} 
                onChange={(e) => setSelectedToken(e.target.value)}
                className="token-select"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </select>
            </div>

            {/* Amount Selection */}
            <div className="form-group">
              <label>Amount</label>
              <div className="amount-selector">
                <div className="amount-slider">
                  {amounts.map((amt, index) => (
                    <div key={amt} className="amount-option">
                      <input
                        type="radio"
                        id={`amount-${amt}`}
                        name="amount"
                        value={amt}
                        checked={amount === amt}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <label htmlFor={`amount-${amt}`} className="amount-label">
                        {amt} {selectedToken}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="slider-track">
                  <div className="slider-progress" style={{
                    width: `${(amounts.indexOf(amount) + 1) * 25}%`
                  }}></div>
                </div>
              </div>
            </div>

            {/* Recipient Address (for deposits) */}
            {activeTab === 'deposit' && (
              <div className="form-group">
                <label>Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="address-input"
                />
              </div>
            )}

            {/* Arbitrator Address (for deposits) */}
            {activeTab === 'deposit' && (
              <div className="form-group">
                <label>Arbitrator Address</label>
                <input
                  type="text"
                  value={arbitrator}
                  onChange={(e) => setArbitrator(e.target.value)}
                  placeholder="0x..."
                  className="address-input"
                />
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="connect-btn">
              {isConnected ? (activeTab === 'deposit' ? 'Create Escrow' : 'Withdraw') : 'Connect'}
            </button>
          </form>
        </div>

        {/* Right Panel - Statistics */}
        <div className="statistics-panel">
          <div className="stats-header">
            <h3>Statistics</h3>
            <span className="version-badge">v0.1 ETH</span>
          </div>

          <div className="stats-content">
            <div className="stat-item">
              <div className="stat-label">
                <span>Anonymity set</span>
                <span className="info-icon">ⓘ</span>
              </div>
              <div className="stat-value">
                {mockStats.anonymitySet.toLocaleString()} <span className="stat-unit">equal user deposits</span>
              </div>
            </div>

            <div className="latest-deposits">
              <h4>Latest deposits</h4>
              <div className="deposits-list">
                <div className="deposits-column">
                  {mockStats.recentDeposits.slice(0, 5).map((deposit) => (
                    <div key={deposit.id} className="deposit-item">
                      <span className="deposit-id">{deposit.id}</span>
                      <span className="deposit-time">{deposit.time}</span>
                    </div>
                  ))}
                </div>
                <div className="deposits-column">
                  {mockStats.recentDeposits.slice(5, 10).map((deposit) => (
                    <div key={deposit.id} className="deposit-item">
                      <span className="deposit-id">{deposit.id}</span>
                      <span className="deposit-time">{deposit.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainInterface