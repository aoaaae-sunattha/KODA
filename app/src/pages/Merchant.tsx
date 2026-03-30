import { useStore } from '../store/useStore'
import { formatCurrency, formatDate } from '../utils/format'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  settled: { bg: '#D1FAE5', color: '#065F46', label: 'Settled' },
  pending: { bg: '#F3F4F6', color: '#374151', label: 'Pending' },
  held:    { bg: '#FEF3C7', color: '#92400E', label: 'Held' },
}

export default function Merchant() {
  const { merchantOrders, currentUser, logout } = useStore()

  const totalSettled = merchantOrders
    .filter(o => o.status === 'settled')
    .reduce((s, o) => s + o.payout, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EC' }}>
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
        <span className="text-xl font-bold" style={{ color: '#5D5FEF' }}>-Anyway</span>
        <span className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
          {currentUser?.businessName ?? 'Merchant Portal'}
        </span>
        <button onClick={logout} className="text-sm" style={{ color: '#6B7280' }}>Log out</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Total Settled Payouts</p>
          <p className="text-3xl font-bold" style={{ color: '#3EB489' }}>{formatCurrency(totalSettled)}</p>
        </div>

        {/* Settlement Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="font-semibold" style={{ color: '#1A1A2E' }}>Settlements</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {['Order', 'Date', 'Amount', 'Commission (2.5%)', 'Payout', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-medium" style={{ color: '#6B7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchantOrders.map((order, i) => {
                const style = STATUS_STYLES[order.status]
                return (
                  <tr
                    key={order.id}
                    className="border-t"
                    style={{ borderColor: '#E5E7EB', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                  >
                    <td className="px-6 py-4 font-medium" style={{ color: '#1A1A2E' }}>{order.orderId}</td>
                    <td className="px-6 py-4" style={{ color: '#6B7280' }}>{formatDate(order.date)}</td>
                    <td className="px-6 py-4" style={{ color: '#1A1A2E' }}>{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4" style={{ color: '#6B7280' }}>{formatCurrency(order.commission)}</td>
                    <td className="px-6 py-4 font-semibold" style={{ color: '#3EB489' }}>{formatCurrency(order.payout)}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {style.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
