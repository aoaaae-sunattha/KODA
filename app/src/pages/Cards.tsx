import { useStore } from '../store/useStore'

export default function Cards() {
  const { cards, setPrimaryCard, removeCard, currentUser } = useStore()

  if (!currentUser) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EC' }}>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Payment Methods</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Manage your saved cards for seamless checkout.</p>
        </header>

        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-lg font-semibold mb-1" style={{ color: '#1A1A2E' }}>No cards saved</p>
            <p className="text-sm" style={{ color: '#6B7280' }}>Add a card to make purchases.</p>
          </div>
        ) : (
          cards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: card.brand === 'visa' ? '#1A1F71' : '#EB001B' }}
                >
                  {card.brand === 'visa' ? 'VISA' : 'MC'}
                </div>
                <div>
                  <p className="font-medium" style={{ color: '#1A1A2E' }}>
                    •••• {card.last4}
                    {card.isExpired && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                        Expired
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {card.isPrimary ? (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#E8E8FD', color: '#5D5FEF' }}>
                    Primary
                  </span>
                ) : (
                  <button
                    onClick={() => setPrimaryCard(card.id)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#5D5FEF' }}
                  >
                    Set primary
                  </button>
                )}
                {!card.isPrimary && (
                  <button
                    onClick={() => removeCard(card.id)}
                    className="text-xs hover:underline"
                    style={{ color: '#EF4444' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
