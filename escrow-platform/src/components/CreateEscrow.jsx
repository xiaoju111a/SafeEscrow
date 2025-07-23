import { useState } from 'react'
import { useAccount } from 'wagmi'

function CreateEscrow({ onCreateEscrow }) {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    seller: '',
    arbitrator: '',
    amount: '',
    description: '',
    timeout: '7' // Default 7 days
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.seller || !formData.arbitrator || !formData.amount || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.seller === address || formData.arbitrator === address) {
      alert('Seller and arbitrator addresses cannot be the same as buyer')
      return
    }

    if (formData.seller === formData.arbitrator) {
      alert('Seller and arbitrator addresses cannot be the same')
      return
    }

    onCreateEscrow({
      buyer: address,
      seller: formData.seller,
      arbitrator: formData.arbitrator,
      amount: parseFloat(formData.amount),
      description: formData.description,
      timeout: parseInt(formData.timeout) * 24 * 60 * 60 * 1000 // Convert to milliseconds
    })

    // Reset form
    setFormData({
      seller: '',
      arbitrator: '',
      amount: '',
      description: '',
      timeout: '7'
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="create-escrow">
      <h2>Create Escrow Transaction</h2>
      
      <form onSubmit={handleSubmit} className="escrow-form">
        <div className="form-group">
          <label htmlFor="seller">Seller Address *</label>
          <input
            type="text"
            id="seller"
            name="seller"
            value={formData.seller}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="arbitrator">Arbitrator Address *</label>
          <input
            type="text"
            id="arbitrator"
            name="arbitrator"
            value={formData.arbitrator}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (ETH) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.1"
            step="0.001"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Transaction Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe the transaction details..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeout">Timeout (Days)</label>
          <select
            id="timeout"
            name="timeout"
            value={formData.timeout}
            onChange={handleChange}
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create Escrow Transaction
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>2/3 Multisig Mechanism</h3>
        <ul>
          <li><strong>Normal Completion:</strong> Buyer + Seller signatures transfer funds to seller</li>
          <li><strong>Dispute Resolution:</strong> Arbitrator + either party can resolve disputes</li>
          <li><strong>Refund Case:</strong> Buyer + Arbitrator signatures can refund to buyer</li>
          <li><strong>Timeout Protection:</strong> Buyer can unilaterally request refund after timeout</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateEscrow