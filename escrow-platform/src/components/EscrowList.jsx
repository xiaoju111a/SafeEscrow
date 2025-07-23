import { useAccount } from 'wagmi'

function EscrowList({ escrows, onViewEscrow }) {
  const { address } = useAccount()

  const getStateLabel = (state) => {
    const stateMap = {
      'funded': '已创建',
      'completed': '已完成',
      'disputed': '争议中',
      'cancelled': '已取消'
    }
    return stateMap[state] || state
  }

  const getStateClass = (state) => {
    return `state-${state}`
  }

  const getUserRole = (escrow) => {
    if (escrow.buyer === address) return '买方'
    if (escrow.seller === address) return '卖方'
    if (escrow.arbitrator === address) return '仲裁员'
    return '观察者'
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

  const isTimeoutReached = (escrow) => {
    return Date.now() > new Date(escrow.createdAt).getTime() + escrow.timeout
  }

  return (
    <div className="escrow-list">
      <div className="list-header">
        <h2>担保交易列表</h2>
        <div className="filter-tabs">
          <button className="active">全部</button>
          <button>进行中</button>
          <button>已完成</button>
        </div>
      </div>

      {escrows.length === 0 ? (
        <div className="empty-state">
          <p>暂无担保交易</p>
          <p>创建第一个担保交易开始使用</p>
        </div>
      ) : (
        <div className="escrow-grid">
          {escrows.map((escrow) => (
            <div key={escrow.id} className="escrow-card">
              <div className="card-header">
                <div className="escrow-id">#{escrow.id}</div>
                <div className={`state-badge ${getStateClass(escrow.state)}`}>
                  {getStateLabel(escrow.state)}
                </div>
              </div>

              <div className="card-content">
                <div className="amount">
                  <span className="label">金额:</span>
                  <span className="value">{escrow.amount} ETH</span>
                </div>

                <div className="description">
                  <span className="label">描述:</span>
                  <p className="value">{escrow.description}</p>
                </div>

                <div className="participants">
                  <div className="participant">
                    <span className="role">买方:</span>
                    <span className="address">
                      {escrow.buyer.slice(0, 6)}...{escrow.buyer.slice(-4)}
                    </span>
                  </div>
                  <div className="participant">
                    <span className="role">卖方:</span>
                    <span className="address">
                      {escrow.seller.slice(0, 6)}...{escrow.seller.slice(-4)}
                    </span>
                  </div>
                  <div className="participant">
                    <span className="role">仲裁员:</span>
                    <span className="address">
                      {escrow.arbitrator.slice(0, 6)}...{escrow.arbitrator.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="meta-info">
                  <div className="your-role">
                    <span className="label">您的角色:</span>
                    <span className="role-badge">{getUserRole(escrow)}</span>
                  </div>
                  
                  <div className="created-time">
                    <span className="label">创建时间:</span>
                    <span className="time">{formatDate(escrow.createdAt)}</span>
                  </div>

                  <div className="signature-count">
                    <span className="label">签名进度:</span>
                    <span className="count">{escrow.signatureCount}/2</span>
                  </div>

                  {isTimeoutReached(escrow) && escrow.state === 'funded' && (
                    <div className="timeout-warning">
                      ⚠️ 已超时，买方可申请退款
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-view"
                  onClick={() => onViewEscrow(escrow)}
                >
                  查看详情
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