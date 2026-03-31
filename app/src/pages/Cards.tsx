import { useStore } from '../store/useStore'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AddCardModal } from '../components/settings/AddCardModal'

export default function Cards() {
  const { cards, setPrimaryCard, removeCard, currentUser } = useStore()
  const [isAddOpen, setIsAddOpen] = useState(false)

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Payment Methods</h1>
            <p className="text-sm text-text-secondary">Manage your saved cards for seamless checkout.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Card
          </button>
        </header>

        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-lg font-semibold mb-1 text-text-primary">No cards saved</p>
            <p className="text-sm text-text-secondary">Add a card to make purchases.</p>
          </div>
        ) : (
          cards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                    card.brand === 'visa' ? 'bg-[#1A1F71]' : 'bg-[#EB001B]'
                  }`}
                >
                  {card.brand === 'visa' ? 'VISA' : 'MC'}
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    •••• {card.last4}
                    {card.isExpired && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500">
                        Expired
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {card.isPrimary ? (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                    Primary
                  </span>
                ) : (
                  <button
                    onClick={() => setPrimaryCard(card.id)}
                    className="text-xs font-medium hover:underline text-primary"
                  >
                    Set primary
                  </button>
                )}
                {!card.isPrimary && (
                  <button
                    onClick={() => removeCard(card.id)}
                    className="text-xs hover:underline text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <AddCardModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}
