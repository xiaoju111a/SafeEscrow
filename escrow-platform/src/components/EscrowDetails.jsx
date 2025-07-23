import { useState } from 'react'
import { useAccount } from 'wagmi'

function EscrowDetails({ escrow, onUpdateEscrow, onBack }) {
  const { address } = useAccount()
  const [isProcessing, setIsProcessing] = useState(false)

  const isParticipant = () => {
    return address === escrow.buyer || address === escrow.seller || address === escrow.arbitrator
  }

  const getUserRole = () => {
    if (address === escrow.buyer) return 'buyer'
    if (address === escrow.seller) return 'seller' 
    if (address === escrow.arbitrator) return 'arbitrator'
    return 'observer'
  }

  const hasUserSigned = () => {
    return escrow.signatures[address] || false
  }

  const canUserSign = () => {
    return isParticipant() && escrow.state === 'funded' && !hasUserSigned()
  }

  const isTimeoutReached = () => {
    return Date.now() > new Date(escrow.createdAt).getTime() + escrow.timeout
  }

  const handleSignRelease = async () => {
    if (!canUserSign()) return

    setIsProcessing(true)
    
    // 模拟签名过程
    setTimeout(() => {
      const updatedEscrow = {
        ...escrow,
        signatures: {
          ...escrow.signatures,
          [address]: true
        },
        signatureCount: escrow.signatureCount + 1
      }

      // 检查是否达到2/3签名
      if (updatedEscrow.signatureCount >= 2) {
        updatedEscrow.state = 'completed'
      }

      onUpdateEscrow(updatedEscrow)
      setIsProcessing(false)
    }, 1000)
  }

  const handleSignRefund = async () => {
    const userRole = getUserRole()
    
    // 只有买方和仲裁员可以签名退款
    if (userRole !== 'buyer' && userRole !== 'arbitrator') {
      alert('只有买方和仲裁员可以签名退款')
      return
    }

    if (!canUserSign()) return

    setIsProcessing(true)

    setTimeout(() => {
      const updatedEscrow = {
        ...escrow,
        signatures: {
          ...escrow.signatures,
          [address]: true
        }
      }

      // 检查是否买方和仲裁员都已签名
      if (updatedEscrow.signatures[escrow.buyer] && updatedEscrow.signatures[escrow.arbitrator]) {
        updatedEscrow.state = 'cancelled'
      }

      onUpdateEscrow(updatedEscrow)
      setIsProcessing(false)
    }, 1000)
  }

  const handleEmergencyRefund = async () => {
    if (getUserRole() !== 'buyer') {
      alert('只有买方可以申请紧急退款')
      return
    }

    if (!isTimeoutReached()) {
      alert('未达到超时时间，无法申请紧急退款')
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      const updatedEscrow = {
        ...escrow,
        state: 'cancelled'
      }
      onUpdateEscrow(updatedEscrow)
      setIsProcessing(false)
    }, 1000)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeoutDate = () => {
    const timeoutDate = new Date(new Date(escrow.createdAt).getTime() + escrow.timeout)
    return formatDate(timeoutDate)
  }

  const getStateLabel = (state) => {
    const stateMap = {
      'funded': '已创建',
      'completed': '已完成',
      'disputed': '争议中',
      'cancelled': '已取消'
    }
    return stateMap[state] || state
  }

  const getRoleLabel = (role) => {
    const roleMap = {
      'buyer': '买方',
      'seller': '卖方',
      'arbitrator': '仲裁员',
      'observer': '观察者'
    }
    return roleMap[role] || role
  }

  return (
    <div className="escrow-details">
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          ← 返回列表
        </button>
        <h2>担保交易详情 #{escrow.id}</h2>
        <div className={`state-badge ${escrow.state}`}>
          {getStateLabel(escrow.state)}
        </div>
      </div>

      <div className="details-content">
        <div className="info-section">
          <h3>基本信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>交易金额</label>
              <value>{escrow.amount} ETH</value>
            </div>
            <div className="info-item">
              <label>创建时间</label>
              <value>{formatDate(escrow.createdAt)}</value>
            </div>
            <div className="info-item">
              <label>超时时间</label>
              <value>{getTimeoutDate()}</value>
            </div>
            <div className="info-item">
              <label>您的角色</label>
              <value className="role-badge">{getRoleLabel(getUserRole())}</value>
            </div>
          </div>
        </div>

        <div className="description-section">
          <h3>交易描述</h3>
          <p className="description-text">{escrow.description}</p>
        </div>

        <div className="participants-section">
          <h3>参与方信息</h3>
          <div className="participants-list">
            <div className="participant-item">
              <div className="participant-role">买方</div>
              <div className="participant-address">{escrow.buyer}</div>
              <div className="participant-status">
                {escrow.signatures[escrow.buyer] ? '✅ 已签名' : '⏳ 未签名'}
              </div>
            </div>
            <div className="participant-item">
              <div className="participant-role">卖方</div>
              <div className="participant-address">{escrow.seller}</div>
              <div className="participant-status">
                {escrow.signatures[escrow.seller] ? '✅ 已签名' : '⏳ 未签名'}
              </div>
            </div>
            <div className="participant-item">
              <div className="participant-role">仲裁员</div>
              <div className="participant-address">{escrow.arbitrator}</div>
              <div className="participant-status">
                {escrow.signatures[escrow.arbitrator] ? '✅ 已签名' : '⏳ 未签名'}
              </div>
            </div>
          </div>
        </div>

        <div className="signature-section">
          <h3>签名进度</h3>
          <div className="signature-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(escrow.signatureCount / 2) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {escrow.signatureCount}/2 签名完成
            </div>
          </div>
        </div>

        {escrow.state === 'funded' && (
          <div className="actions-section">
            <h3>可执行操作</h3>
            <div className="action-buttons">
              {canUserSign() && (
                <>
                  <button 
                    className="btn-release"
                    onClick={handleSignRelease}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '处理中...' : '签名确认收货'}
                  </button>

                  {(getUserRole() === 'buyer' || getUserRole() === 'arbitrator') && (
                    <button 
                      className="btn-refund"
                      onClick={handleSignRefund}
                      disabled={isProcessing}
                    >
                      {isProcessing ? '处理中...' : '签名申请退款'}
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
                  {isProcessing ? '处理中...' : '紧急退款'}
                </button>
              )}

              {!isParticipant() && (
                <p className="no-actions">您不是此交易的参与方，无法执行操作</p>
              )}

              {hasUserSigned() && (
                <p className="already-signed">✅ 您已签名，等待其他参与方操作</p>
              )}
            </div>
          </div>
        )}

        {escrow.state === 'completed' && (
          <div className="completed-section">
            <div className="success-message">
              ✅ 交易已完成，资金已转给卖方
            </div>
          </div>
        )}

        {escrow.state === 'cancelled' && (
          <div className="cancelled-section">
            <div className="cancelled-message">
              ❌ 交易已取消，资金已退还给买方
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EscrowDetails