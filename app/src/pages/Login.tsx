import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loginError } = useStore()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(email)
    if (ok) {
      const user = useStore.getState().currentUser
      navigate(user?.role === 'merchant' ? '/merchant' : '/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0EC' }}>
      <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold" style={{ color: '#5D5FEF' }}>-Koda</span>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Buy Now, Pay Later</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="active@koda.test"
              required
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition"
              style={{ borderColor: '#E5E7EB', color: '#1A1A2E' }}
              onFocus={e => (e.target.style.borderColor = '#5D5FEF')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Any password works"
              required
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition"
              style={{ borderColor: '#E5E7EB', color: '#1A1A2E' }}
              onFocus={e => (e.target.style.borderColor = '#5D5FEF')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {loginError && (
            <p className="text-sm text-center" style={{ color: '#EF4444' }}>{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#5D5FEF' }}
          >
            Log in
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 rounded-xl p-4 text-xs" style={{ backgroundColor: '#F5F0EC', color: '#6B7280' }}>
          <p className="font-semibold mb-1">Demo accounts:</p>
          {[
            'active@koda.test',
            'overdue@koda.test',
            'declined@koda.test',
            'merchant@koda.test',
          ].map(e => (
            <button
              key={e}
              onClick={() => setEmail(e)}
              className="block hover:underline text-left"
              style={{ color: '#5D5FEF' }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
