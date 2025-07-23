import { useState } from 'react'
import { useAccount } from 'wagmi'

function CreateEscrow({ onCreateEscrow }) {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    seller: '',
    arbitrator: '',
    amount: '',
    description: '',
    timeout: '7' // 默认7天
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.seller || !formData.arbitrator || !formData.amount || !formData.description) {
      alert('请填写所有必填字段')
      return
    }

    if (formData.seller === address || formData.arbitrator === address) {
      alert('卖方和仲裁员地址不能与买方相同')
      return
    }

    if (formData.seller === formData.arbitrator) {
      alert('卖方和仲裁员地址不能相同')
      return
    }

    onCreateEscrow({
      buyer: address,
      seller: formData.seller,
      arbitrator: formData.arbitrator,
      amount: parseFloat(formData.amount),
      description: formData.description,
      timeout: parseInt(formData.timeout) * 24 * 60 * 60 * 1000 // 转换为毫秒
    })

    // 重置表单
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
      <h2>创建担保交易</h2>
      
      <form onSubmit={handleSubmit} className="escrow-form">
        <div className="form-group">
          <label htmlFor="seller">卖方地址 *</label>
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
          <label htmlFor="arbitrator">仲裁员地址 *</label>
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
          <label htmlFor="amount">金额 (ETH) *</label>
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
          <label htmlFor="description">交易描述 *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="请详细描述交易内容..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeout">超时时间 (天)</label>
          <select
            id="timeout"
            name="timeout"
            value={formData.timeout}
            onChange={handleChange}
          >
            <option value="1">1天</option>
            <option value="3">3天</option>
            <option value="7">7天</option>
            <option value="14">14天</option>
            <option value="30">30天</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            创建担保交易
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>2/3多签机制说明</h3>
        <ul>
          <li><strong>正常完成：</strong>买方+卖方共同签名，资金转给卖方</li>
          <li><strong>争议处理：</strong>仲裁员+任一方签名可解决争议</li>
          <li><strong>退款情况：</strong>买方+仲裁员签名可退款给买方</li>
          <li><strong>超时保护：</strong>超时后买方可单方面申请退款</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateEscrow